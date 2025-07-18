import { create } from 'zustand';
import { AppState, ChatMessage, Order, OrderStatus, Appointment, OrderHistory } from '@/types';

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

  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    set((state) => {
      const updatedOrders = state.orders.map(order => 
        order.id === orderId 
          ? { ...order, status, updatedAt: new Date() }
          : order
      );

      const newHistoryEntry: OrderHistory = {
        id: Date.now().toString(),
        orderId,
        status,
        timestamp: new Date(),
        notes: `Status updated to ${status}`
      };

      return {
        orders: updatedOrders,
        orderHistory: [...state.orderHistory, newHistoryEntry],
        selectedOrder: state.selectedOrder?.id === orderId 
          ? { ...state.selectedOrder, status, updatedAt: new Date() }
          : state.selectedOrder
      };
    });
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
}));

export default useAppStore; 