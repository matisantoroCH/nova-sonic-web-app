'use client';

import React, { useState } from 'react';
import {
  Input,
  Button,
  SpaceBetween,
  Box,
  Alert
} from '@cloudscape-design/components';
import { apiService } from '@/lib/api';
import { Order, Appointment } from '@/types';

interface SmartSearchProps {
  onOrderFound: (order: Order) => void;
  onAppointmentFound: (appointment: Appointment) => void;
  onError: (error: string) => void;
}

export default function SmartSearch({ onOrderFound, onAppointmentFound, onError }: SmartSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const term = searchTerm.trim().toLowerCase();
      
      // Detectar si es un pedido
      if (term.includes('pedido') || term.includes('order')) {
        const numberMatch = term.match(/\d+/);
        if (numberMatch) {
          const orderNumber = numberMatch[0];
          const order = await apiService.getOrderById(orderNumber);
          onOrderFound(order);
          return;
        }
      }
      
      // Detectar si es una cita
      if (term.includes('cita') || term.includes('appointment') || term.includes('turno')) {
        const numberMatch = term.match(/\d+/);
        if (numberMatch) {
          const appointmentNumber = numberMatch[0];
          const appointment = await apiService.getAppointmentById(appointmentNumber);
          onAppointmentFound(appointment);
          return;
        }
      }
      
      // Si es solo un número, intentar como pedido primero
      if (/^\d+$/.test(term)) {
        try {
          const order = await apiService.getOrderById(term);
          onOrderFound(order);
          return;
        } catch (orderError) {
          // Si no es un pedido, intentar como cita
          try {
            const appointment = await apiService.getAppointmentById(term);
            onAppointmentFound(appointment);
            return;
          } catch (appointmentError) {
            setError('No se encontró ningún pedido o cita con ese número');
          }
        }
      }
      
      setError('Formato de búsqueda no reconocido. Usa "pedido 3" o "cita 5"');
      
    } catch (error) {
      setError('Error al buscar. Verifica el número e intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = ({ detail }: { detail: { key: string } }) => {
    if (detail.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box>
      <SpaceBetween size="m">
        <div>
          <Input
            value={searchTerm}
            onChange={({ detail }) => setSearchTerm(detail.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por 'pedido 3', 'cita 5', o solo '3'"
            disabled={isLoading}
          />
        </div>
        <Button
          variant="primary"
          onClick={handleSearch}
          loading={isLoading}
          disabled={!searchTerm.trim()}
        >
          Buscar
        </Button>
        
        {error && (
          <Alert
            type="error"
            dismissible
            onDismiss={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        <div className="text-sm text-gray-600">
          <strong>Ejemplos de búsqueda:</strong>
          <ul className="mt-1 ml-4">
            <li>• "pedido 3" - Busca el pedido número 3</li>
            <li>• "cita 5" - Busca la cita número 5</li>
            <li>• "3" - Busca automáticamente pedido o cita número 3</li>
          </ul>
        </div>
      </SpaceBetween>
    </Box>
  );
} 