'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import Swal from 'sweetalert2';

export default function ChatInterface() {
  const {
    messages,
    voiceSession,
    addMessage,
    setVoiceSession,
    updateUserTranscription,
    updateNovaResponse,
    executeTool,
    lastToolExecution
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldScroll && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShouldScroll(false);
    }
  }, [messages, shouldScroll]);

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onstart = () => {
        console.log('🎤 Reconocimiento de voz iniciado');
        setVoiceSession({ isListening: true });
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update real-time transcription
        updateUserTranscription(finalTranscript + interimTranscript);

        // If we have a final result, process it
        if (finalTranscript) {
          handleUserSpeech(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Error en reconocimiento de voz:', event.error);
        setVoiceSession({ isListening: false });
      };

      recognitionRef.current.onend = () => {
        console.log('🎤 Reconocimiento de voz terminado');
        setVoiceSession({ isListening: false });
      };
    }
  }, [setVoiceSession, updateUserTranscription]);

  // WebSocket connection for Nova Sonic backend
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

    websocketManager.onMessage((message) => {
      console.log('📨 Mensaje recibido de Nova Sonic:', message);
      
      switch (message.type) {
        case 'chat':
          const novaMessage: ChatMessage = {
            id: `nova-ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content: message.payload.content,
            sender: 'nova-sonic',
            timestamp: new Date(message.payload.timestamp)
          };
          addMessage(novaMessage);
          updateNovaResponse(message.payload.content);
          break;

        case 'tool_execution':
          handleToolExecution(message.payload);
          break;

        case 'audio_response':
          // Handle Nova Sonic's audio response
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
  }, [addMessage, updateNovaResponse]);

  // Handle tool execution results
  useEffect(() => {
    if (lastToolExecution && lastToolExecution.success) {
      showSuccessAlert(lastToolExecution.message);
    } else if (lastToolExecution && !lastToolExecution.success) {
      showErrorAlert(lastToolExecution.message);
    }
  }, [lastToolExecution]);

  const handleUserSpeech = async (transcript: string) => {
    console.log('🎤 Usuario dijo:', transcript);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: transcript,
      sender: 'user',
      timestamp: new Date()
    };
    addMessage(userMessage);
    setShouldScroll(true);
    
    setIsProcessing(true);
    updateNovaResponse('Procesando...');

    try {
      // Simulate Nova Sonic processing
      const novaResponse = await processWithNovaSonic(transcript);
      
      // Add Nova Sonic response
      const novaMessage: ChatMessage = {
        id: `nova-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: novaResponse,
        sender: 'nova-sonic',
        timestamp: new Date()
      };
      addMessage(novaMessage);
      setShouldScroll(true);
      updateNovaResponse(novaResponse);
      
    } catch (error) {
      console.error('Error procesando con Nova Sonic:', error);
      updateNovaResponse('Lo siento, hubo un error procesando tu solicitud.');
    } finally {
      setIsProcessing(false);
      updateUserTranscription('');
    }
  };

  const processWithNovaSonic = async (userInput: string): Promise<string> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const input = userInput.toLowerCase();

    // Check for order-related commands
    if (input.includes('pedido') || input.includes('orden')) {
      if (input.includes('estado') || input.includes('status')) {
        const orderId = extractOrderId(input);
        if (orderId) {
          const result = await executeTool('get_order_status', { orderId });
          return result.message;
        } else {
          return 'Por favor, especifica el número de pedido que quieres consultar.';
        }
      }
      
      if (input.includes('cancelar') || input.includes('cancel')) {
        const orderId = extractOrderId(input);
        if (orderId) {
          const result = await executeTool('cancel_order', { orderId });
          return result.message;
        } else {
          return 'Por favor, especifica el número de pedido que quieres cancelar.';
        }
      }
      
      if (input.includes('crear') || input.includes('nuevo') || input.includes('nueva')) {
        const result = await executeTool('create_order', {
          customerName: 'Cliente por Voz',
          customerEmail: 'cliente@voz.com',
          items: [],
          total: 0
        });
        return result.message;
      }
    }

    // Check for appointment-related commands
    if (input.includes('cita') || input.includes('turno') || input.includes('appointment')) {
      if (input.includes('estado') || input.includes('status')) {
        const appointmentId = extractAppointmentId(input);
        if (appointmentId) {
          const result = await executeTool('get_appointment', { appointmentId });
          return result.message;
        } else {
          return 'Por favor, especifica el número de cita que quieres consultar.';
        }
      }
      
      if (input.includes('cancelar') || input.includes('cancel')) {
        const appointmentId = extractAppointmentId(input);
        if (appointmentId) {
          const result = await executeTool('cancel_appointment', { appointmentId });
          return result.message;
        } else {
          return 'Por favor, especifica el número de cita que quieres cancelar.';
        }
      }
      
      if (input.includes('agendar') || input.includes('crear') || input.includes('nueva')) {
        const result = await executeTool('create_appointment', {
          patientName: 'Paciente por Voz',
          patientEmail: 'paciente@voz.com',
          doctorName: 'Dr. General',
          date: new Date().toISOString(),
          duration: 30,
          type: 'consultation'
        });
        return result.message;
      }
    }

    // Default response
    return `Entendí que dijiste: "${userInput}". Puedo ayudarte con pedidos y citas. ¿Qué te gustaría hacer?`;
  };

  const extractOrderId = (input: string): string | null => {
    const match = input.match(/(?:pedido|orden)\s*(?:número|#|num)?\s*(\d+)/i);
    return match ? match[1] : null;
  };

  const extractAppointmentId = (input: string): string | null => {
    const match = input.match(/(?:cita|turno)\s*(?:número|#|num)?\s*(\d+)/i);
    return match ? match[1] : null;
  };

  const showSuccessAlert = (message: string) => {
    Swal.fire({
      title: '¡Éxito!',
      text: message,
      icon: 'success',
      confirmButtonText: 'Entendido',
      timer: 3000,
      timerProgressBar: true
    });
  };

  const showErrorAlert = (message: string) => {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      confirmButtonText: 'Entendido'
    });
  };

  const startVoiceConversation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopVoiceConversation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    handleUserSpeech(inputValue);
    setInputValue('');
    setShouldScroll(true);
  };

  const handleKeyPress = ({ detail }: { detail: { key: string; shiftKey: boolean } }) => {
    if (detail.key === 'Enter' && !detail.shiftKey) {
      handleSendMessage();
    }
  };

  return (
    <Container>
      <Header
        variant="h1"
        description="Conversación por voz con Nova Sonic - Speech-to-Speech"
        actions={
          <SpaceBetween size="s" direction="horizontal">
            <StatusIndicator
              type={voiceSession.isListening ? 'success' : 'pending'}
              iconAriaLabel={voiceSession.isListening ? 'Escuchando' : 'No escuchando'}
            >
              {voiceSession.isListening ? 'Escuchando...' : 'Modo Demo - Listo para voz'}
            </StatusIndicator>
            {isProcessing ? (
              <StatusIndicator type="in-progress">
                Nova Sonic procesando...
              </StatusIndicator>
            ) : null}
          </SpaceBetween>
        }
      >
        Chat con Nova Sonic
      </Header>

      <SpaceBetween size="l">
        {/* Voice Controls */}
        <Box textAlign="center">
          <SpaceBetween size="m" direction="horizontal">
                         <Button
               variant={voiceSession.isListening ? 'primary' : 'normal'}
               iconName={voiceSession.isListening ? 'microphone-off' : 'microphone'}
               onClick={voiceSession.isListening ? stopVoiceConversation : startVoiceConversation}
             >
               {voiceSession.isListening ? 'Detener Conversación' : 'Iniciar Conversación por Voz'}
             </Button>
          </SpaceBetween>
        </Box>

                 {/* Real-time Transcription */}
         {voiceSession.userTranscription ? (
           <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg theme-transition">
             <Header variant="h3">Tu voz:</Header>
             <p className="text-gray-900 dark:text-gray-100">{voiceSession.userTranscription}</p>
           </div>
         ) : null}

         {voiceSession.novaResponse ? (
           <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg theme-transition">
             <Header variant="h3">Nova Sonic:</Header>
             <p className="text-gray-900 dark:text-gray-100">{voiceSession.novaResponse}</p>
           </div>
         ) : null}

        {/* Messages Area */}
        <div 
          className="chat-area border border-gray-200 dark:border-gray-600 rounded-lg p-4 h-96 overflow-auto"
        >
          <SpaceBetween size="m">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
                  <div className="text-4xl mb-4">🎤</div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>¡Hola! Soy Nova Sonic</h3>
                  <p className="text-sm">Haz clic en "Iniciar Conversación por Voz" para comenzar a hablar conmigo.</p>
                  <p className="text-xs mt-2 opacity-70">Puedo ayudarte con pedidos y citas médicas.</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white ml-auto max-w-xs' 
                      : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 max-w-xs theme-transition'
                  }`}
                  style={{ 
                    textAlign: message.sender === 'user' ? 'right' : 'left',
                    marginLeft: message.sender === 'user' ? 'auto' : '0'
                  }}
                >
                  <div className="text-sm font-semibold mb-1">
                    {message.sender === 'user' ? 'Tú' : 'Nova Sonic'}
                  </div>
                  <div className={`mb-2 ${message.sender === 'user' ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                    {message.content}
                  </div>
                  <div className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </SpaceBetween>
          <div ref={messagesEndRef} />
        </div>

        {/* Text Input (Fallback) */}
        <SpaceBetween size="s">
          <Textarea
            value={inputValue}
            onChange={({ detail }) => setInputValue(detail.value)}
            onKeyDown={handleKeyPress}
            placeholder="O escribe tu mensaje aquí como alternativa..."
            rows={2}
            disabled={isProcessing}
          />
          
          <Button
            variant="primary"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
          >
            Enviar
          </Button>

          {audioError ? (
            <StatusIndicator type="error">
              {audioError}
            </StatusIndicator>
          ) : null}

          <StatusIndicator type="info">
            Modo Demo - Funcionalidades básicas disponibles
          </StatusIndicator>
        </SpaceBetween>
      </SpaceBetween>
    </Container>
  );
} 