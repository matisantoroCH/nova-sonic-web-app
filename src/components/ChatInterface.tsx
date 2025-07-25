'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Container,
  Header,
  SpaceBetween,
  StatusIndicator,
  Textarea,
  Modal,
  FormField,
  Select,
  Checkbox
} from '@cloudscape-design/components';
import websocketManager from '@/lib/websocket';
import { base64ToFloat32Array } from '@/helper/audioHelper';
import AudioPlayer from '@/helper/audioPlayer';
import { WebSocketMessage } from '@/types';
import useAppStore from '@/lib/store';
import Swal from 'sweetalert2';
import { useNovaSonicAudio } from '@/hooks/useNovaSonicAudio';
import S2sEvent from '@/helper/s2sEvents';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    generationStage?: string;
}

export default function ChatInterface() {
    const [sessionStarted, setSessionStarted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentTranscription, setCurrentTranscription] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [configVoiceId, setConfigVoiceId] = useState('carlos');
    const [configSystemPrompt, setConfigSystemPrompt] = useState('Eres Carlos, el asistente virtual de Nova Sonic. Eres amable, profesional y hablas en español argentino. Tu función es ayudar a los usuarios con: - Consultar, cancelar y crear pedidos - Agendar, cancelar, modificar y consultar citas médicas Siempre responde de forma clara y natural. Si necesitas más información, pídela amablemente. IMPORTANTE: Cuando uses herramientas (tools), SIEMPRE envía los números como dígitos, no como palabras. Por ejemplo: usa \'6\' en lugar de \'seis\', \'627\' en lugar de \'seiscientos veintisiete\', \'10065\' en lugar de \'diez mil sesenta y cinco\'. Para consultar o cancelar pedidos, SIEMPRE pide DNI o nombre completo para verificar identidad. Para consultar, cancelar o modificar citas, SIEMPRE pide nombre del paciente para verificar identidad. Esto es crucial para que las herramientas funcionen correctamente.');
    const [configToolUse, setConfigToolUse] = useState('{}');
    const [configChatHistory, setConfigChatHistory] = useState('[]');
    const [includeChatHistory, setIncludeChatHistory] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Session names from backend
    const [sessionNames, setSessionNames] = useState<{
        promptName: string;
        systemContentName: string;
        audioContentName: string;
    } | null>(null);
    
    const audioPlayerRef = useRef<AudioPlayer | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const promptNameRef = useRef<string>('');
    const textContentNameRef = useRef<string>('');
    const audioContentNameRef = useRef<string>('');
    
    // Use the Nova Sonic audio hook
    const { isRecording, isConnected, startRecording, stopRecording, error } = useNovaSonicAudio();

    // Initialize audio player
    useEffect(() => {
        audioPlayerRef.current = new AudioPlayer();
        audioPlayerRef.current.start().catch(err => {
            console.error("Failed to initialize audio player:", err);
        });

        return () => {
            if (audioPlayerRef.current) {
                audioPlayerRef.current.stop();
            }
        };
    }, []);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // WebSocket message handler
    const handleWebSocketMessage = useCallback((message: any) => {
        console.log('Received WebSocket message:', message);
        
        const messageType = message.type;
        
        switch (messageType) {
            case 'session_started':
                console.log('Session started:', message.payload.message);
                setSessionStarted(true);
                // Store session names from backend
                if (message.payload.promptName) {
                    setSessionNames({
                        promptName: message.payload.promptName,
                        systemContentName: message.payload.systemContentName,
                        audioContentName: message.payload.audioContentName
                    });
                }
                break;
                
            case 'transcription':
                setCurrentTranscription(message.payload.text);
                break;
                
            case 'nova_response':
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: message.payload.text,
                    timestamp: Date.now()
                }]);
                setCurrentTranscription('');
                setIsProcessing(false);
                break;
                
            case 'audio_response':
                try {
                    const audioData = message.payload.audioData;
                    const float32Array = base64ToFloat32Array(audioData);
                    if (audioPlayerRef.current) {
                        audioPlayerRef.current.playAudio(float32Array);
                        setIsPlaying(true);
                        // Reset playing state after a delay
                        setTimeout(() => setIsPlaying(false), 3000);
                    }
                } catch (error) {
                    console.error("Error processing audio response:", error);
                }
                break;
                
            case 'session_ended':
                console.log('Session ended:', message.payload.message);
                setSessionStarted(false);
                setSessionNames(null);
                break;
                
            case 'error':
                console.error("Error from server:", message.payload.message);
                Swal.fire({
                    title: 'Error',
                    text: message.payload.message,
                    icon: 'error',
                    confirmButtonText: 'Entendido'
                });
                break;
        }
    }, []);

    // Connect to WebSocket and set up message handler
    useEffect(() => {
        websocketManager.onMessage(handleWebSocketMessage);
        
        // Connect to WebSocket
        websocketManager.connect().catch(err => {
            console.error('Failed to connect to WebSocket:', err);
        });

        return () => {
            websocketManager.disconnect();
        };
    }, [handleWebSocketMessage]);

    const startSession = useCallback(async () => {
        if (!isConnected) {
            console.log('WebSocket not connected, connecting...');
            await websocketManager.connect();
        }

        try {
            // Send session start message to server
            websocketManager.sendMessage({
                type: 'start_session',
                payload: {
                    voiceId: configVoiceId,
                    systemPrompt: configSystemPrompt,
                    toolConfig: configToolUse ? JSON.parse(configToolUse) : {},
                    includeChatHistory: includeChatHistory,
                    chatHistory: includeChatHistory ? JSON.parse(configChatHistory) : []
                },
                timestamp: new Date()
            });
            
            // Don't set sessionStarted here - wait for server confirmation
            setMessages([]);
            setCurrentTranscription('');
            console.log('Session start request sent');
            
        } catch (error) {
            console.error('Error starting session:', error);
            throw error; // Re-throw to be handled by caller
        }
    }, [isConnected, configVoiceId, configSystemPrompt, configToolUse, includeChatHistory, configChatHistory]);

    const endSession = useCallback(async () => {
        try {
            // Send session end message to server
            websocketManager.sendMessage({
                type: 'end_session',
                payload: {},
                timestamp: new Date()
            });
            
            // Don't set sessionStarted here - wait for server confirmation
            setMessages([]);
            setCurrentTranscription('');
            
            console.log('Session end request sent');
        } catch (error) {
            console.error('Error ending session:', error);
        }
    }, []);

    const toggleRecording = useCallback(async () => {
        if (isRecording) {
            await stopRecording();
            setIsProcessing(false);
        } else {
            try {
                if (!sessionStarted) {
                    await startSession();
                    // Wait a moment for session to be properly established
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                setIsProcessing(true);
                
                // Use session names from backend
                if (!sessionNames) {
                    throw new Error('Session names not available from backend');
                }
                
                // Send S2S events to start audio session (like in the workshop)
                websocketManager.sendMessage({
                    type: 's2s_event',
                    payload: S2sEvent.contentStartAudio(sessionNames.promptName, sessionNames.audioContentName),
                    timestamp: new Date()
                });
                
                await startRecording(sessionNames.promptName, sessionNames.audioContentName);
            } catch (error) {
                console.error('Error starting recording:', error);
                setIsProcessing(false);
                // Show error to user
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo iniciar la grabación. Asegúrate de que la sesión esté activa.',
                    icon: 'error',
                    confirmButtonText: 'Entendido'
                });
            }
        }
    }, [isRecording, sessionStarted, startRecording, stopRecording, sessionNames]);

    const cancelAudio = useCallback(() => {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.bargeIn();
            setIsPlaying(false);
        }
    }, []);

    return (
        <Container>
            <Header
                variant="h1"
                description="Conversación por voz con Nova Sonic - Speech-to-Speech"
                actions={
                    <SpaceBetween size="s" direction="horizontal">
                        <StatusIndicator
                            key="connection"
                            type={isConnected ? 'success' : 'pending'}
                            iconAriaLabel={isConnected ? 'Conectado' : 'Desconectado'}
                        >
                            {isConnected ? 'Conectado' : 'Desconectado'}
                        </StatusIndicator>
                        {isRecording && (
                            <StatusIndicator key="recording" type="success">
                                Grabando...
                            </StatusIndicator>
                        )}
                        {isProcessing && (
                            <StatusIndicator key="processing" type="in-progress">
                                Procesando...
                            </StatusIndicator>
                        )}
                        {isPlaying && (
                            <StatusIndicator key="playing" type="success">
                                Reproduciendo...
                            </StatusIndicator>
                        )}
                        <Button
                            key="settings"
                            variant="icon"
                            iconName="settings"
                            onClick={() => setShowConfig(true)}
                        />
                    </SpaceBetween>
                }
            >
                Nova Sonic Voice Chat
            </Header>

            <SpaceBetween size="l">
                {/* Voice Controls */}
                <Box key="voice-controls" textAlign="center" padding={{ top: 's', bottom: 'xxs' }}>
                    {!sessionStarted && (
                        <Box key="session-warning" margin={{ bottom: 's' }}>
                            <p style={{ color: '#666', fontSize: '14px' }}>
                                ⚠️ Primero debes iniciar una sesión para poder grabar
                            </p>
                        </Box>
                    )}
                    <SpaceBetween key="voice-buttons" size="m" direction="horizontal">
                        <Button
                            key="toggleRecording"
                            variant={isRecording ? 'primary' : 'normal'}
                            iconName={isRecording ? 'microphone-off' : 'microphone'}
                            onClick={toggleRecording}
                            disabled={!isConnected || (!sessionStarted && !isRecording)}
                        >
                            {isRecording ? 'Detener Grabación' : 'Iniciar Grabación'}
                        </Button>
                        
                        {isPlaying && (
                            <Button
                                key="cancel-audio"
                                variant="normal"
                                iconName="microphone-off"
                                onClick={cancelAudio}
                            >
                                Detener Audio
                            </Button>
                        )}
                    </SpaceBetween>
                </Box>

                {/* Session Controls */}
                <Box key="session-controls" textAlign="center">
                    <SpaceBetween key="session-buttons" size="s" direction="horizontal">
                        <Button
                            key="start-session"
                            onClick={startSession}
                            variant="normal"
                            disabled={!isConnected || sessionStarted}
                        >
                            Iniciar Sesión
                        </Button>
                        <Button
                            key="end-session"
                            onClick={endSession}
                            variant="normal"
                            disabled={!sessionStarted}
                        >
                            Finalizar Sesión
                        </Button>
                    </SpaceBetween>
                </Box>

                {/* Real-time Transcription */}
                {currentTranscription && (
                    <Box key="transcription-box" padding="s">
                        <Header variant="h3">Transcribiendo...</Header>
                        <p>{currentTranscription}</p>
                    </Box>
                )}

                {/* Messages Area */}
                <div 
                    key="messages-area"
                    className="chat-area border border-gray-200 rounded-lg p-4 h-96 overflow-auto"
                    style={{ backgroundColor: '#f5f4f4' }}
                >
                    <SpaceBetween key="messages-space" size="m">
                        {messages.length === 0 ? (
                            <div key="messages-empty" className="flex items-center justify-center h-full">
                                <div key="messages-empty-content" className="text-center">
                                    <div className="text-4xl mb-4">🎤</div>
                                    <h3 className="text-lg font-semibold mb-2">¡Hola! Soy Nova Sonic</h3>
                                    <p className="text-sm">Haz clic en "Iniciar Grabación" para comenzar a hablar conmigo.</p>
                                    <p className="text-xs mt-2 opacity-70">Puedo ayudarte con pedidos y citas médicas.</p>
                                </div>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`p-3 rounded-lg ${
                                        message.role === 'user' 
                                            ? 'bg-blue-500 text-white ml-auto max-w-xs' 
                                            : 'bg-gray-100 border border-gray-200 max-w-xs'
                                    }`}
                                    style={{ 
                                        textAlign: message.role === 'user' ? 'right' : 'left',
                                        marginLeft: message.role === 'user' ? 'auto' : '0'
                                    }}
                                >
                                    <div className="text-sm font-semibold mb-1">
                                        {message.role === 'user' ? 'Tú' : 'Nova Sonic'}
                                        {message.generationStage && (
                                            <span className="text-xs opacity-70 ml-2">
                                                [{message.generationStage}]
                                            </span>
                                        )}
                                    </div>
                                    <div className={`mb-2 ${message.role === 'user' ? 'text-white' : 'text-gray-900'}`}>
                                        {message.content}
                                    </div>
                                    <div className="text-xs opacity-70">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </SpaceBetween>
                    <div ref={messagesEndRef} />
                </div>

                {/* Error Display */}
                {error && (
                    <StatusIndicator key="error-indicator" type="error">
                        {error}
                    </StatusIndicator>
                )}

                {/* Configuration Modal */}
                <Modal
                    key="config-modal"
                    visible={showConfig}
                    onDismiss={() => setShowConfig(false)}
                    header="Configuración de Nova Sonic"
                    size="large"
                >
                    <SpaceBetween size="l">
                        <FormField
                            key="voice-id"
                            label="Voice ID"
                            stretch={true}
                        >
                            <Select
                                selectedOption={{ label: getVoiceLabel(configVoiceId), value: configVoiceId }}
                                onChange={({ detail }) => setConfigVoiceId(detail.selectedOption.value || 'carlos')}
                                options={[
                                    { label: "Carlos (Spanish)", value: "carlos" },
                                    { label: "Matthew (en-US)", value: "matthew" },
                                    { label: "Tiffany (en-US)", value: "tiffany" },
                                    { label: "Amy (en-GB)", value: "amy" },
                                    { label: "Lupe (Spanish)", value: "lupe"},
                                ]}
                            />
                        </FormField>
                        
                        <FormField
                            key="system-prompt" 
                            label="System Prompt"
                            description="Prompt del sistema para el modelo de voz"
                            stretch={true}
                        >
                            <Textarea
                                value={configSystemPrompt}
                                onChange={({ detail }) => setConfigSystemPrompt(detail.value)}
                                placeholder="System prompt for the speech model"
                                rows={8}
                            />
                        </FormField>
                        
                        <FormField
                            key="tool-config"
                            label="Tool Configuration"
                            description="Configuración de herramientas para integración externa"
                            stretch={true}
                        >
                            <Textarea
                                value={configToolUse}
                                onChange={({ detail }) => setConfigToolUse(detail.value)}
                                rows={6}
                                placeholder="{}"
                            />
                        </FormField>
                        
                        <FormField
                            key="include-chat-history"
                            label="Chat History"
                            stretch={true}
                        >
                            <Checkbox
                                checked={includeChatHistory}
                                onChange={({ detail }) => setIncludeChatHistory(detail.checked)}
                            >
                                Incluir historial de chat
                            </Checkbox>
                        </FormField>
                        
                        {includeChatHistory && (
                            <FormField
                                key="chat-history"
                                label="Chat History"
                                description="Historial de chat de ejemplo para continuar conversación"
                                stretch={true}
                            >
                                <Textarea
                                    value={configChatHistory}
                                    onChange={({ detail }) => setConfigChatHistory(detail.value)}
                                    rows={8}
                                    placeholder="[]"
                                />
                            </FormField>
                        )}
                    </SpaceBetween>
                </Modal>
            </SpaceBetween>
        </Container>
    );
}

function getVoiceLabel(voiceId: string): string {
    const voices: Record<string, string> = {
        'carlos': 'Carlos (Spanish)',
        'matthew': 'Matthew (en-US)',
        'tiffany': 'Tiffany (en-US)',
        'amy': 'Amy (en-GB)',
        'lupe': 'Lupe (Spanish)'
    };
    return voices[voiceId] || voiceId;
} 