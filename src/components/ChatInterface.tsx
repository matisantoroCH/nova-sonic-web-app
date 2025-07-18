'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Header,
  SpaceBetween,
  StatusIndicator,
  Textarea
} from '@cloudscape-design/components';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import useAppStore from '@/lib/store';
import websocketManager from '@/lib/websocket';
import { ChatMessage } from '@/types';

export default function ChatInterface() {
  const {
    messages,
    isRecording,
    isTranscribing,
    addMessage,
    setRecording,
    setTranscribing
  } = useAppStore();

  const {
    isRecording: audioIsRecording,
    startRecording,
    stopRecording,
    resetRecording,
    error: audioError
  } = useAudioRecorder();

  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isPlayingNovaAudio, setIsPlayingNovaAudio] = useState(false);
  const [novaAudioUrl, setNovaAudioUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const novaAudioRef = useRef<HTMLAudioElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WebSocket connection for real-time communication with Nova Sonic
  useEffect(() => {
    // Temporarily disable WebSocket connection until backend is ready
    console.log('🔧 WebSocket deshabilitado temporalmente - Backend no disponible');
    setIsConnected(false);
    
    // TODO: Enable when backend is ready
    /*
    const connectWebSocket = async () => {
      try {
        await websocketManager.connect();
        setIsConnected(true);
        console.log('✅ Conectado al backend de Nova Sonic');
      } catch (error) {
        console.error('❌ Error conectando al backend de Nova Sonic:', error);
        setIsConnected(false);
      }
    };

    websocketManager.onConnect(() => {
      setIsConnected(true);
      console.log('🟢 WebSocket conectado - Listo para comunicación bidireccional');
    });

    websocketManager.onDisconnect(() => {
      setIsConnected(false);
      console.log('🔴 WebSocket desconectado');
    });

    // Handle different types of messages from Nova Sonic backend
    websocketManager.onMessage((message) => {
      console.log('📨 Mensaje recibido de Nova Sonic:', message);
      
      switch (message.type) {
        case 'chat':
          // Text response from Nova Sonic
          const novaMessage: ChatMessage = {
            id: Date.now().toString(),
            content: message.payload.content,
            sender: 'nova-sonic',
            timestamp: new Date(message.payload.timestamp)
          };
          addMessage(novaMessage);
          break;

        case 'audio_response':
          // Audio response from Nova Sonic (Speech-to-Speech)
          if (message.payload.audioData) {
            const audioBlob = new Blob([message.payload.audioData], { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setNovaAudioUrl(audioUrl);
            
            // Auto-play Nova Sonic's audio response
            if (novaAudioRef.current) {
              novaAudioRef.current.src = audioUrl;
              novaAudioRef.current.play().then(() => {
                setIsPlayingNovaAudio(true);
              }).catch(error => {
                console.error('Error reproduciendo audio de Nova Sonic:', error);
              });
            }
          }
          break;

        case 'transcription_complete':
          // Audio transcription completed
          setTranscribing(false);
          if (message.payload.transcription) {
            const transcribedMessage: ChatMessage = {
              id: Date.now().toString(),
              content: message.payload.transcription,
              sender: 'user',
              timestamp: new Date(),
              transcribed: true
            };
            addMessage(transcribedMessage);
          }
          break;

        case 'nova_speaking':
          // Nova Sonic is currently speaking
          setIsPlayingNovaAudio(true);
          break;

        case 'nova_silent':
          // Nova Sonic finished speaking
          setIsPlayingNovaAudio(false);
          break;

        default:
          console.log('📝 Mensaje no manejado:', message);
      }
    });

    connectWebSocket();

    return () => {
      websocketManager.disconnect();
    };
    */
  }, [addMessage, setTranscribing]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    addMessage(userMessage);
    
    // TODO: Enable when backend is ready
    // websocketManager.sendTextToNovaSonic(inputValue);
    
    // Simulate Nova Sonic response for testing
    setTimeout(() => {
      const novaResponse: ChatMessage = {
        id: Date.now().toString(),
        content: `Hola! Soy Nova Sonic. Recibí tu mensaje: "${inputValue}". El backend estará disponible pronto.`,
        sender: 'nova-sonic',
        timestamp: new Date()
      };
      addMessage(novaResponse);
    }, 1000);
    
    setInputValue('');
  };

  const handleAudioRecording = async () => {
    if (audioIsRecording) {
      setRecording(false);
      const recording = await stopRecording();
      if (recording) {
        setTranscribing(true);
        
        // TODO: Enable when backend is ready
        // websocketManager.sendAudioForTranscription(recording.blob);
        
        console.log('🎤 Audio grabado - Backend no disponible aún');
        
        // Simulate transcription for testing
        setTimeout(() => {
          const transcribedMessage: ChatMessage = {
            id: Date.now().toString(),
            content: "Mensaje de audio transcrito (simulado) - Backend estará disponible pronto",
            sender: 'user',
            timestamp: new Date(),
            audioUrl: URL.createObjectURL(recording.blob),
            transcribed: true
          };
          addMessage(transcribedMessage);
          setTranscribing(false);
        }, 2000);
      }
    } else {
      setRecording(true);
      await startRecording();
      console.log('🎙️ Iniciando grabación de audio...');
    }
  };

  const handleKeyPress = ({ detail }: { detail: { key: string; shiftKey: boolean } }) => {
    if (detail.key === 'Enter' && !detail.shiftKey) {
      handleSendMessage();
    }
  };

  const handleNovaAudioEnd = () => {
    setIsPlayingNovaAudio(false);
    console.log('🔇 Audio de Nova Sonic terminado');
  };

  return (
    <Container>
      <Header
        variant="h1"
        description="Chat en tiempo real con Nova Sonic - Speech-to-Speech"
        actions={
          <SpaceBetween size="s" direction="horizontal">
            <StatusIndicator
              type="pending"
              iconAriaLabel="Backend en desarrollo"
            >
              Modo Demo - Backend en desarrollo
            </StatusIndicator>
            {isPlayingNovaAudio && (
              <StatusIndicator type="in-progress">
                Nova Sonic hablando...
              </StatusIndicator>
            )}
          </SpaceBetween>
        }
      >
        Chat con Nova Sonic
      </Header>

      <SpaceBetween size="l">
        {/* Messages Area */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-96 overflow-auto">
          <SpaceBetween size="m">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-blue-500 text-white ml-auto max-w-xs' 
                    : 'bg-white border border-gray-200 max-w-xs'
                }`}
                style={{ 
                  textAlign: message.sender === 'user' ? 'right' : 'left',
                  marginLeft: message.sender === 'user' ? 'auto' : '0'
                }}
              >
                <div className="text-sm font-semibold mb-1">
                  {message.sender === 'user' ? 'Tú' : 'Nova Sonic'}
                </div>
                <div className="mb-2">{message.content}</div>
                {message.audioUrl && (
                  <audio controls src={message.audioUrl} className="max-w-full" />
                )}
                <div className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </SpaceBetween>
        </div>

        {/* Hidden audio element for Nova Sonic's responses */}
        <audio
          ref={novaAudioRef}
          onEnded={handleNovaAudioEnd}
          onError={(e) => console.error('Error en audio de Nova Sonic:', e)}
          style={{ display: 'none' }}
        />

        {/* Input Area */}
        <SpaceBetween size="s">
          <Textarea
            value={inputValue}
            onChange={({ detail }) => setInputValue(detail.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escribe tu mensaje o usa el micrófono para hablar con Nova Sonic..."
            rows={3}
            disabled={isTranscribing || isPlayingNovaAudio}
          />
          
          <SpaceBetween size="s" direction="horizontal">
            <Button
              variant={audioIsRecording ? 'primary' : 'normal'}
              iconName={audioIsRecording ? 'microphone-off' : 'microphone'}
              onClick={handleAudioRecording}
              disabled={isTranscribing || isPlayingNovaAudio}
            >
              {audioIsRecording ? 'Detener Grabación' : 'Grabar Audio'}
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTranscribing || isPlayingNovaAudio}
            >
              Enviar
            </Button>
          </SpaceBetween>

          {isTranscribing && (
            <StatusIndicator type="pending">
              Transcribiendo audio y procesando con Nova Sonic...
            </StatusIndicator>
          )}

          {audioError && (
            <StatusIndicator type="error">
              {audioError}
            </StatusIndicator>
          )}

          <StatusIndicator type="info">
            Modo Demo - Funcionalidades básicas disponibles
          </StatusIndicator>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  );
} 