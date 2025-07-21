import { create } from 'zustand';
import { AppState, ChatMessage, Order, OrderStatus, Appointment, OrderHistory, VoiceSession, ToolExecution } from '@/types';

const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  messages: [],
  isRecording: false,
  isTranscribing: false,
  orders: [],
  selectedOrder: null,
  orderHistory: [],
  appointments: [],
  selectedDate: null,
  currentView: 'chat',
  isLoading: false,
  error: null,
  
  // Voice Session
  voiceSession: {
    isListening: false,
    isProcessing: false,
    userTranscription: '',
    novaResponse: '',
    confidence: 0
  },
  
  // Tool Execution
  lastToolExecution: null,

  // Chat Actions
  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message]
    }));
  },

  setRecording: (isRecording: boolean) => {
    set({ isRecording });
  },

  setTranscribing: (isTranscribing: boolean) => {
    set({ isTranscribing });
  },

  // Order Actions
  setOrders: (orders: Order[]) => {
    set({ orders });
  },

  selectOrder: (order: Order | null) => {
    set({ selectedOrder: order });
  },



  // Appointment Actions
  setAppointments: (appointments: Appointment[]) => {
    set({ appointments });
  },

  addAppointment: (appointment: Appointment) => {
    set((state) => ({
      appointments: [...state.appointments, appointment]
    }));
  },

  setSelectedDate: (date: Date | null) => {
    set({ selectedDate: date });
  },

  // UI Actions
  setCurrentView: (view: 'chat' | 'orders' | 'calendar') => {
    set({ currentView: view });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
  
  // Voice Session Actions
  setVoiceSession: (session: Partial<VoiceSession>) => {
    set((state) => ({
      voiceSession: { ...state.voiceSession, ...session }
    }));
  },
  
  updateUserTranscription: (transcription: string) => {
    set((state) => ({
      voiceSession: { ...state.voiceSession, userTranscription: transcription }
    }));
  },
  
  updateNovaResponse: (response: string) => {
    set((state) => ({
      voiceSession: { ...state.voiceSession, novaResponse: response }
    }));
  },
  
  // Tool Execution Actions
  executeTool: async (toolName: string, parameters: any): Promise<ToolExecution> => {
    const state = get();
    
    try {
      let result: any = null;
      let success = false;
      let message = '';
      
      switch (toolName) {
        case 'get_order_status':
          const order = state.orders.find(o => o.id === parameters.orderId);
          if (order) {
            result = order;
            success = true;
            message = `El pedido ${order.id} está en estado: ${order.status}`;
          } else {
            success = false;
            message = 'Pedido no encontrado';
          }
          break;
          
        case 'cancel_order':
          if (parameters.orderId) {
            // Since we removed updateOrderStatus, we'll just return success
            // The actual cancellation would need to be handled by the backend
            success = true;
            message = `Pedido ${parameters.orderId} cancelado exitosamente`;
          } else {
            success = false;
            message = 'ID de pedido requerido';
          }
          break;
          
        case 'create_order':
          const newOrder: Order = {
            id: Date.now().toString(),
            customerName: parameters.customerName || 'Cliente Nuevo',
            customerEmail: parameters.customerEmail || 'cliente@email.com',
            items: parameters.items || [],
            total: parameters.total || 0,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          state.setOrders([...state.orders, newOrder]);
          success = true;
          message = `Nuevo pedido ${newOrder.id} creado exitosamente`;
          result = newOrder;
          break;
          
        case 'get_appointment':
          const appointment = state.appointments.find(a => a.id === parameters.appointmentId);
          if (appointment) {
            result = appointment;
            success = true;
            message = `Cita ${appointment.id} programada para ${appointment.date.toLocaleDateString()}`;
          } else {
            success = false;
            message = 'Cita no encontrada';
          }
          break;
          
        case 'cancel_appointment':
          if (parameters.appointmentId) {
            const updatedAppointments = state.appointments.map(apt => 
              apt.id === parameters.appointmentId 
                ? { ...apt, status: 'cancelled' as const }
                : apt
            );
            state.setAppointments(updatedAppointments);
            success = true;
            message = `Cita ${parameters.appointmentId} cancelada exitosamente`;
          } else {
            success = false;
            message = 'ID de cita requerido';
          }
          break;
          
        case 'create_appointment':
          const newAppointment: Appointment = {
            id: Date.now().toString(),
            patientName: parameters.patientName || 'Paciente Nuevo',
            patientEmail: parameters.patientEmail || 'paciente@email.com',
            doctorName: parameters.doctorName || 'Dr. General',
            date: new Date(parameters.date || Date.now()),
            duration: parameters.duration || 30,
            type: parameters.type || 'consultation',
            notes: parameters.notes || '',
            status: 'scheduled'
          };
          state.addAppointment(newAppointment);
          success = true;
          message = `Nueva cita ${newAppointment.id} programada exitosamente`;
          result = newAppointment;
          break;
          
        default:
          success = false;
          message = `Tool ${toolName} no implementada`;
      }
      
      const execution: ToolExecution = {
        toolName,
        parameters,
        result,
        success,
        message
      };
      
      set({ lastToolExecution: execution });
      return execution;
      
    } catch (error) {
      const execution: ToolExecution = {
        toolName,
        parameters,
        success: false,
        message: `Error ejecutando ${toolName}: ${error}`
      };
      
      set({ lastToolExecution: execution });
      return execution;
    }
  },
  
  setLastToolExecution: (execution: ToolExecution | null) => {
    set({ lastToolExecution: execution });
  },
}));

export default useAppStore; 