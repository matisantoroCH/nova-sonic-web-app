import { useState, useRef, useCallback, useEffect } from 'react';
import websocketManager from '@/lib/websocket';
import { S2sEvent } from '@/helper/s2sEvents';

interface UseNovaSonicAudioReturn {
  isRecording: boolean;
  isConnected: boolean;
  startRecording: (promptName: string, audioContentName: string) => Promise<void>;
  stopRecording: () => Promise<void>;
  error: string | null;
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const useNovaSonicAudio = (): UseNovaSonicAudioReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const promptNameRef = useRef<string>('');
  const audioContentNameRef = useRef<string>('');

  // WebSocket connection status
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    websocketManager.onConnect(handleConnect);
    websocketManager.onDisconnect(handleDisconnect);

    // Check initial connection status
    const checkConnection = () => {
      setIsConnected(websocketManager.isConnected());
    };
    checkConnection();

    return () => {
      // Cleanup is handled automatically by the websocket manager
    };
  }, []);

  const startRecording = useCallback(async (promptName: string, audioContentName: string) => {
    try {
      promptNameRef.current = promptName;
      audioContentNameRef.current = audioContentName;

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;

      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive'
      });
      audioContextRef.current = audioContext;

      // Load the audio worklet
      const workletUrl = new URL('../helper/audioRecorderProcessor.worklet.js', import.meta.url).toString();
      await audioContext.audioWorklet.addModule(workletUrl);

      // Create source and worklet node
      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, 'audio-recorder-processor');

      sourceRef.current = source;
      workletNodeRef.current = workletNode;

      // Set up message handler for audio data from worklet
      workletNode.port.onmessage = (event) => {
        if (event.data.type === 'audio_data' && isRecording) {
          // Convert ArrayBuffer to base64
          const base64Audio = arrayBufferToBase64(event.data.audioData);
          
          // Send audio using S2S protocol (like in the workshop)
          const audioEvent = S2sEvent.audioInput(
            promptName, 
            audioContentName, 
            base64Audio
          );
          
          // Send the event directly to the backend
          websocketManager.sendMessage({
            type: 's2s_event',
            payload: audioEvent.event, // Send just the event part
            timestamp: new Date()
          });
        }
      };

      // Connect the audio nodes
      source.connect(workletNode);
      workletNode.connect(audioContext.destination);

      // Start recording in the worklet
      workletNode.port.postMessage({
        type: 'start',
        promptName: promptName,
        audioContentName: audioContentName
      });

      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Error starting recording');
      throw err;
    }
  }, [isRecording]);

  const stopRecording = useCallback(async () => {
    try {
      setIsRecording(false);

      // Stop recording in the worklet
      if (workletNodeRef.current) {
        workletNodeRef.current.port.postMessage({ type: 'stop' });
        workletNodeRef.current.disconnect();
        workletNodeRef.current = null;
      }

      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }

      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      setError(null);
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError(err instanceof Error ? err.message : 'Error stopping recording');
      throw err;
    }
  }, []);

  return {
    isRecording,
    isConnected,
    startRecording,
    stopRecording,
    error
  };
}; 