'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Header,
  SpaceBetween,
  StatusIndicator,
  Modal,
  Form,
  FormField,
  Input,
  Select,
  Textarea,
  Cards
} from '@cloudscape-design/components';
import Calendar from '@cloudscape-design/components/calendar';
import useAppStore from '@/lib/store';
import { Appointment } from '@/types';

// Mock data for appointments
const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientName: 'Ana Martínez',
    patientEmail: 'ana.martinez@email.com',
    doctorName: 'Dr. Carlos Rodríguez',
    date: new Date('2024-01-20T10:00:00'),
    duration: 30,
    type: 'consultation',
    notes: 'Consulta de rutina',
    status: 'scheduled'
  },
  {
    id: '2',
    patientName: 'Luis Fernández',
    patientEmail: 'luis.fernandez@email.com',
    doctorName: 'Dra. María López',
    date: new Date('2024-01-22T14:30:00'),
    duration: 45,
    type: 'follow-up',
    notes: 'Seguimiento post-cirugía',
    status: 'confirmed'
  },
  {
    id: '3',
    patientName: 'Carmen Ruiz',
    patientEmail: 'carmen.ruiz@email.com',
    doctorName: 'Dr. Juan Pérez',
    date: new Date('2024-01-25T09:00:00'),
    duration: 60,
    type: 'emergency',
    notes: 'Dolor agudo en el abdomen',
    status: 'scheduled'
  }
];

const appointmentTypeOptions = [
  { label: 'Consulta', value: 'consultation' },
  { label: 'Seguimiento', value: 'follow-up' },
  { label: 'Emergencia', value: 'emergency' },
  { label: 'Rutina', value: 'routine' }
];

const statusOptions = [
  { label: 'Programada', value: 'scheduled' },
  { label: 'Confirmada', value: 'confirmed' },
  { label: 'Cancelada', value: 'cancelled' },
  { label: 'Completada', value: 'completed' }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'pending';
    case 'confirmed':
      return 'success';
    case 'cancelled':
      return 'error';
    case 'completed':
      return 'success';
    default:
      return 'pending';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'Programada';
    case 'confirmed':
      return 'Confirmada';
    case 'cancelled':
      return 'Cancelada';
    case 'completed':
      return 'Completada';
    default:
      return status;
  }
};

export default function CalendarInterface() {
  const { appointments, selectedDate, setAppointments, addAppointment, setSelectedDate } = useAppStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    doctorName: '',
    date: '',
    time: '',
    duration: 30,
    type: 'consultation',
    notes: ''
  });

  useEffect(() => {
    // Load mock data
    setAppointments(mockAppointments);
  }, [setAppointments]);

  const handleDateChange = ({ detail }: { detail: { value: string } }) => {
    const date = new Date(detail.value);
    setSelectedDate(date);
    
    // Find appointments for the selected date
    const dayAppointments = appointments.filter(apt => 
      apt.date.toDateString() === date.toDateString()
    );
    
    if (dayAppointments.length > 0) {
      setSelectedAppointment(dayAppointments[0]);
      setIsModalVisible(true);
    }
  };

  const handleCreateAppointment = () => {
    const [hours, minutes] = formData.time.split(':');
    const appointmentDate = new Date(formData.date);
    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      patientName: formData.patientName,
      patientEmail: formData.patientEmail,
      doctorName: formData.doctorName,
      date: appointmentDate,
      duration: formData.duration,
      type: formData.type as any,
      notes: formData.notes,
      status: 'scheduled'
    };

    addAppointment(newAppointment);
    setIsModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      patientName: '',
      patientEmail: '',
      doctorName: '',
      date: '',
      time: '',
      duration: 30,
      type: 'consultation',
      notes: ''
    });
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      apt.date.toDateString() === date.toDateString()
    );
  };

  return (
    <Container>
      <Header
        variant="h1"
        description="Gestión de citas médicas"
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setSelectedAppointment(null);
              setIsModalVisible(true);
            }}
          >
            Nueva Cita
          </Button>
        }
      >
        Calendario de Citas
      </Header>

      <SpaceBetween size="l">
        <Box>
          <Calendar
            value={selectedDate?.toISOString().split('T')[0] || ''}
            onChange={handleDateChange}
            locale="es-ES"
          />
        </Box>

        {/* Appointments for selected date */}
        {selectedDate && (
          <Box>
            <Header variant="h2">
              Citas para {selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Header>
            <SpaceBetween size="m">
              {getAppointmentsForDate(selectedDate).map(appointment => (
                <div
                  key={appointment.id}
                  className="p-4 border border-gray-200 rounded-lg bg-white"
                >
                  <SpaceBetween size="s">
                    <div className="flex justify-between items-center">
                      <div>
                        <strong>{appointment.patientName}</strong> - {appointment.doctorName}
                      </div>
                      <StatusIndicator type={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </StatusIndicator>
                    </div>
                    <div className="text-sm text-gray-600">
                      {appointment.date.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - {appointment.duration} min
                    </div>
                    <div className="text-sm">
                      <strong>Tipo:</strong> {appointmentTypeOptions.find(opt => opt.value === appointment.type)?.label}
                    </div>
                    {appointment.notes && (
                      <div className="text-sm">
                        <strong>Notas:</strong> {appointment.notes}
                      </div>
                    )}
                  </SpaceBetween>
                </div>
              ))}
              {getAppointmentsForDate(selectedDate).length === 0 && (
                <Box textAlign="center" color="text-body-secondary">
                  No hay citas programadas para esta fecha
                </Box>
              )}
            </SpaceBetween>
          </Box>
        )}

        {/* Modal for appointment details/creation */}
        <Modal
          visible={isModalVisible}
          onDismiss={() => {
            setIsModalVisible(false);
            resetForm();
          }}
          header={selectedAppointment ? "Detalles de la Cita" : "Nueva Cita"}
          size="large"
        >
          {selectedAppointment ? (
            <SpaceBetween size="l">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Paciente:</strong> {selectedAppointment.patientName}
                </div>
                <div>
                  <strong>Email:</strong> {selectedAppointment.patientEmail}
                </div>
                <div>
                  <strong>Doctor:</strong> {selectedAppointment.doctorName}
                </div>
                <div>
                  <strong>Fecha:</strong> {selectedAppointment.date.toLocaleDateString()}
                </div>
                <div>
                  <strong>Hora:</strong> {selectedAppointment.date.toLocaleTimeString()}
                </div>
                <div>
                  <strong>Duración:</strong> {selectedAppointment.duration} min
                </div>
                <div>
                  <strong>Tipo:</strong> {appointmentTypeOptions.find(opt => opt.value === selectedAppointment.type)?.label}
                </div>
                <div>
                  <strong>Estado:</strong> 
                  <StatusIndicator type={getStatusColor(selectedAppointment.status)}>
                    {getStatusText(selectedAppointment.status)}
                  </StatusIndicator>
                </div>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <strong>Notas:</strong>
                  <div className="mt-2 p-3 bg-gray-50 rounded">{selectedAppointment.notes}</div>
                </div>
              )}
            </SpaceBetween>
          ) : (
            <Form
              actions={
                <SpaceBetween size="s" direction="horizontal">
                  <Button
                    variant="link"
                    onClick={() => {
                      setIsModalVisible(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCreateAppointment}
                    disabled={!formData.patientName || !formData.patientEmail || !formData.doctorName || !formData.date || !formData.time}
                  >
                    Crear Cita
                  </Button>
                </SpaceBetween>
              }
            >
              <SpaceBetween size="l">
                <FormField label="Nombre del Paciente">
                  <Input
                    value={formData.patientName}
                    onChange={({ detail }) => setFormData({ ...formData, patientName: detail.value })}
                    placeholder="Ingrese el nombre del paciente"
                  />
                </FormField>
                
                <FormField label="Email del Paciente">
                  <Input
                    value={formData.patientEmail}
                    onChange={({ detail }) => setFormData({ ...formData, patientEmail: detail.value })}
                    placeholder="Ingrese el email del paciente"
                    type="email"
                  />
                </FormField>
                
                <FormField label="Doctor">
                  <Input
                    value={formData.doctorName}
                    onChange={({ detail }) => setFormData({ ...formData, doctorName: detail.value })}
                    placeholder="Ingrese el nombre del doctor"
                  />
                </FormField>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Fecha">
                    <Input
                      value={formData.date}
                      onChange={({ detail }) => setFormData({ ...formData, date: detail.value })}
                    />
                  </FormField>
                  
                  <FormField label="Hora">
                    <Input
                      value={formData.time}
                      onChange={({ detail }) => setFormData({ ...formData, time: detail.value })}
                    />
                  </FormField>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Duración (minutos)">
                    <Select
                      selectedOption={{ label: `${formData.duration} min`, value: formData.duration.toString() }}
                      onChange={({ detail }) => setFormData({ ...formData, duration: parseInt(detail.selectedOption.value || '30') })}
                      options={[
                        { label: '15 min', value: '15' },
                        { label: '30 min', value: '30' },
                        { label: '45 min', value: '45' },
                        { label: '60 min', value: '60' }
                      ]}
                    />
                  </FormField>
                  
                  <FormField label="Tipo de Cita">
                    <Select
                      selectedOption={appointmentTypeOptions.find(opt => opt.value === formData.type) || null}
                      onChange={({ detail }) => setFormData({ ...formData, type: detail.selectedOption.value || 'consultation' })}
                      options={appointmentTypeOptions}
                    />
                  </FormField>
                </div>
                
                <FormField label="Notas">
                  <Textarea
                    value={formData.notes}
                    onChange={({ detail }) => setFormData({ ...formData, notes: detail.value })}
                    placeholder="Notas adicionales sobre la cita"
                    rows={3}
                  />
                </FormField>
              </SpaceBetween>
            </Form>
          )}
        </Modal>
      </SpaceBetween>
    </Container>
  );
} 