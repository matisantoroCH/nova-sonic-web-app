import { WebSocketMessage } from '@/types';
import { getWebSocketUrl } from './config';

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private url: string;
  private onMessageCallback: ((message: WebSocketMessage) => void) | null = null;
  private onConnectCallback: (() => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;

  constructor(url?: string) {
    this.url = url || getWebSocketUrl();
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          if (this.onConnectCallback) {
            this.onConnectCallback();
          }
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            if (this.onMessageCallback) {
              this.onMessageCallback(message);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          if (this.onDisconnectCallback) {
            this.onDisconnectCallback();
          }
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  // Send chat message
  sendChatMessage(content: string, audioUrl?: string): void {
    const message: WebSocketMessage = {
      type: 'chat',
      payload: {
        content,
        audioUrl,
        timestamp: new Date()
      },
      timestamp: new Date()
    };
    this.send(message);
  }

  // Send order update
  sendOrderUpdate(orderId: string, status: string): void {
    const message: WebSocketMessage = {
      type: 'order_update',
      payload: {
        orderId,
        status,
        timestamp: new Date()
      },
      timestamp: new Date()
    };
    this.send(message);
  }

  // Send appointment update
  sendAppointmentUpdate(appointmentId: string, action: 'create' | 'update' | 'delete'): void {
    const message: WebSocketMessage = {
      type: 'appointment_update',
      payload: {
        appointmentId,
        action,
        timestamp: new Date()
      },
      timestamp: new Date()
    };
    this.send(message);
  }

  // Send audio for transcription and Speech-to-Speech processing
  sendAudioForTranscription(audioBlob: Blob): void {
    const reader = new FileReader();
    reader.onload = () => {
      const message: WebSocketMessage = {
        type: 'audio_transcription',
        payload: {
          audioData: reader.result,
          timestamp: new Date(),
          requestType: 'speech_to_speech' // Indicate this is for Nova Sonic processing
        },
        timestamp: new Date()
      };
      this.send(message);
    };
    reader.readAsDataURL(audioBlob);
  }

  // Send text message for Nova Sonic processing
  sendTextToNovaSonic(text: string): void {
    const message: WebSocketMessage = {
      type: 'chat',
      payload: {
        content: text,
        timestamp: new Date(),
        requestType: 'text_to_speech' // Request audio response from Nova Sonic
      },
      timestamp: new Date()
    };
    this.send(message);
  }

  // Event handlers
  onMessage(callback: (message: WebSocketMessage) => void): void {
    this.onMessageCallback = callback;
  }

  onConnect(callback: () => void): void {
    this.onConnectCallback = callback;
  }

  onDisconnect(callback: () => void): void {
    this.onDisconnectCallback = callback;
  }

  // Get connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const websocketManager = new WebSocketManager();

export default websocketManager; 