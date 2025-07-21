// Chat Types
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'nova-sonic';
  timestamp: Date;
  audioUrl?: string;
  transcribed?: boolean;
}

export interface AudioRecording {
  id: string;
  blob: Blob;
  duration: number;
  timestamp: Date;
}

// Order Types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
  trackingNumber?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  description?: string;
}

export interface OrderHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  timestamp: Date;
  notes?: string;
}

// Appointment Types
export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  date: Date;
  duration: number; // in minutes
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'doctor';
  avatar?: string;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'chat' | 'order_update' | 'appointment_update' | 'audio_transcription' | 'audio_response' | 'transcription_complete' | 'nova_speaking' | 'nova_silent' | 'tool_execution' | 'tool_result';
  payload: any;
  timestamp: Date;
}

// Nova Sonic Tools
export interface NovaTool {
  name: string;
  description: string;
  parameters: any;
  execute: (params: any) => Promise<any>;
}

export interface ToolExecution {
  toolName: string;
  parameters: any;
  result?: any;
  success: boolean;
  message: string;
}

// Voice Conversation Types
export interface VoiceSession {
  isListening: boolean;
  isProcessing: boolean;
  userTranscription: string;
  novaResponse: string;
  confidence: number;
}

// Store Types
export interface AppState {
  // Chat
  messages: ChatMessage[];
  isRecording: boolean;
  isTranscribing: boolean;
  
  // Orders
  orders: Order[];
  selectedOrder: Order | null;
  orderHistory: OrderHistory[];
  
  // Appointments
  appointments: Appointment[];
  selectedDate: Date | null;
  
  // UI
  currentView: 'chat' | 'orders' | 'calendar';
  isLoading: boolean;
  error: string | null;
  
  // Voice Session
  voiceSession: VoiceSession;
  
  // Tool Execution
  lastToolExecution: ToolExecution | null;
  
  // Actions
  addMessage: (message: ChatMessage) => void;
  setRecording: (isRecording: boolean) => void;
  setTranscribing: (isTranscribing: boolean) => void;
  setOrders: (orders: Order[]) => void;
  selectOrder: (order: Order | null) => void;
  setAppointments: (appointments: Appointment[]) => void;
  addAppointment: (appointment: Appointment) => void;
  setSelectedDate: (date: Date | null) => void;
  setCurrentView: (view: 'chat' | 'orders' | 'calendar') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Voice Session Actions
  setVoiceSession: (session: Partial<VoiceSession>) => void;
  updateUserTranscription: (transcription: string) => void;
  updateNovaResponse: (response: string) => void;
  
  // Tool Execution Actions
  executeTool: (toolName: string, parameters: any) => Promise<ToolExecution>;
  setLastToolExecution: (execution: ToolExecution | null) => void;
} 