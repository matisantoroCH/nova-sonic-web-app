import { Order, Appointment } from '@/types';
import { getApiUrl } from './api-config';

// Helper function to ensure dates are displayed in Argentina timezone
function parseArgentinaDate(dateString: string): Date {
  // If the date string already has timezone info (like -03:00), use it as is
  if (dateString.includes('T') && (dateString.includes('Z') || dateString.includes('+'))) {
    return new Date(dateString);
  }
  
  // If it's a simple date string, assume it's in Argentina timezone (UTC-3)
  const argentinaOffset = -3 * 60; // UTC-3 in minutes
  const date = new Date(dateString);
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utcTime + (argentinaOffset * 60000));
}

// Helper functions for formatting dates in Argentina timezone
export function formatArgentinaDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    ...options
  });
}

export function formatArgentinaTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
  return date.toLocaleTimeString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    ...options
  });
}

// API service for handling HTTP requests
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiUrl('');
  }

  // Generic fetch wrapper with error handling
  private async fetchWithErrorHandling<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        mode: 'cors', // Explicitly enable CORS
        credentials: 'omit', // Don't send cookies
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Orders API
  async getOrders(): Promise<Order[]> {
    const response = await this.fetchWithErrorHandling<any>('/orders');
    const ordersData = response.data || response; // Handle both wrapped and unwrapped responses
    return ordersData.map((order: any) => ({
      ...order,
      createdAt: parseArgentinaDate(order.createdAt),
      updatedAt: parseArgentinaDate(order.updatedAt),
      estimatedDelivery: order.estimatedDelivery ? parseArgentinaDate(order.estimatedDelivery) : undefined
    }));
  }

  async getOrderById(orderId: string): Promise<Order> {
    const response = await this.fetchWithErrorHandling<any>(`/orders/${orderId}`);
    const orderData = response.data || response; // Handle both wrapped and unwrapped responses
    return {
      ...orderData,
      createdAt: parseArgentinaDate(orderData.createdAt),
      updatedAt: parseArgentinaDate(orderData.updatedAt),
      estimatedDelivery: orderData.estimatedDelivery ? parseArgentinaDate(orderData.estimatedDelivery) : undefined
    };
  }



  // Appointments API
  async getAppointments(): Promise<Appointment[]> {
    const response = await this.fetchWithErrorHandling<any>('/appointments');
    const appointmentsData = response.data || response; // Handle both wrapped and unwrapped responses
    return appointmentsData.map((appointment: any) => ({
      ...appointment,
      date: parseArgentinaDate(appointment.date)
    }));
  }

  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const response = await this.fetchWithErrorHandling<any>(`/appointments?date=${dateString}`);
    const appointmentsData = response.data || response; // Handle both wrapped and unwrapped responses
    return appointmentsData.map((appointment: any) => ({
      ...appointment,
      date: parseArgentinaDate(appointment.date)
    }));
  }

  async getAppointmentById(appointmentId: string): Promise<Appointment> {
    const response = await this.fetchWithErrorHandling<any>(`/appointments/${appointmentId}`);
    const appointmentData = response.data || response; // Handle both wrapped and unwrapped responses
    return {
      ...appointmentData,
      date: parseArgentinaDate(appointmentData.date)
    };
  }


}

// Export singleton instance
export const apiService = new ApiService(); 