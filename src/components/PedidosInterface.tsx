'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Header,
  SpaceBetween,
  StatusIndicator,
  Table,
  Modal,
  Cards,
  Select,
  Badge
} from '@cloudscape-design/components';
import useAppStore from '@/lib/store';
import { Order, OrderStatus } from '@/types';

// Mock data for orders
const mockOrders: Order[] = [
  {
    id: '1',
    customerName: 'Juan Pérez',
    customerEmail: 'juan.perez@email.com',
    items: [
      { id: '1', name: 'Producto A', quantity: 2, price: 25.99, description: 'Descripción del producto A' },
      { id: '2', name: 'Producto B', quantity: 1, price: 15.50, description: 'Descripción del producto B' }
    ],
    total: 67.48,
    status: 'pending',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    estimatedDelivery: new Date('2024-01-20')
  },
  {
    id: '2',
    customerName: 'María García',
    customerEmail: 'maria.garcia@email.com',
    items: [
      { id: '3', name: 'Producto C', quantity: 3, price: 12.99, description: 'Descripción del producto C' }
    ],
    total: 38.97,
    status: 'processing',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-16'),
    trackingNumber: 'TRK123456789'
  },
  {
    id: '3',
    customerName: 'Carlos López',
    customerEmail: 'carlos.lopez@email.com',
    items: [
      { id: '4', name: 'Producto D', quantity: 1, price: 45.00, description: 'Descripción del producto D' },
      { id: '5', name: 'Producto E', quantity: 2, price: 8.99, description: 'Descripción del producto E' }
    ],
    total: 62.98,
    status: 'shipped',
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-17'),
    trackingNumber: 'TRK987654321',
    estimatedDelivery: new Date('2024-01-19')
  }
];

const statusOptions = [
  { label: 'Pendiente', value: 'pending' },
  { label: 'Procesando', value: 'processing' },
  { label: 'Enviado', value: 'shipped' },
  { label: 'Entregado', value: 'delivered' },
  { label: 'Cancelado', value: 'cancelled' }
];

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'pending';
    case 'processing':
      return 'in-progress';
    case 'shipped':
      return 'success';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'pending';
  }
};

const getStatusText = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'processing':
      return 'Procesando';
    case 'shipped':
      return 'Enviado';
    case 'delivered':
      return 'Entregado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status;
  }
};

export default function PedidosInterface() {
  const { orders, selectedOrder, setOrders, selectOrder, updateOrderStatus } = useAppStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending');

  useEffect(() => {
    // Load mock data
    setOrders(mockOrders);
  }, [setOrders]);

  const handleStatusUpdate = (orderId: string) => {
    updateOrderStatus(orderId, selectedStatus);
    setIsModalVisible(false);
  };

  const tableItems = orders.map(order => ({
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    total: `$${order.total.toFixed(2)}`,
    status: order.status,
    createdAt: order.createdAt.toLocaleDateString(),
    updatedAt: order.updatedAt.toLocaleDateString()
  }));

  const tableColumns = [
    {
      id: 'id',
      header: 'ID Pedido',
      cell: (item: any) => item.id
    },
    {
      id: 'customerName',
      header: 'Cliente',
      cell: (item: any) => item.customerName
    },
    {
      id: 'customerEmail',
      header: 'Email',
      cell: (item: any) => item.customerEmail
    },
    {
      id: 'total',
      header: 'Total',
      cell: (item: any) => item.total
    },
    {
      id: 'status',
      header: 'Estado',
      cell: (item: any) => (
        <StatusIndicator type={getStatusColor(item.status)}>
          {getStatusText(item.status)}
        </StatusIndicator>
      )
    },
    {
      id: 'createdAt',
      header: 'Fecha Creación',
      cell: (item: any) => item.createdAt
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: (item: any) => (
        <SpaceBetween size="xs" direction="horizontal">
          <Button
            variant="link"
            onClick={() => {
              const order = orders.find(o => o.id === item.id);
              if (order) {
                selectOrder(order);
                setIsModalVisible(true);
              }
            }}
          >
            Ver Detalles
          </Button>
        </SpaceBetween>
      )
    }
  ];

  return (
    <Container>
      <Header
        variant="h1"
        description="Gestión y seguimiento de pedidos"
      >
        Seguimiento de Pedidos
      </Header>

      <SpaceBetween size="l">
        <Table
          items={tableItems}
          columnDefinitions={tableColumns}
          loadingText="Cargando pedidos..."
          empty="No hay pedidos disponibles"
          header="Lista de Pedidos"
        />

        {selectedOrder && (
          <Modal
            visible={isModalVisible}
            onDismiss={() => setIsModalVisible(false)}
            header="Detalles del Pedido"
            size="large"
          >
            <SpaceBetween size="l">
              <Cards
                cardDefinition={{
                  header: (item: any) => item.name,
                  sections: [
                    {
                      id: 'quantity',
                      header: 'Cantidad',
                      content: (item: any) => item.quantity
                    },
                    {
                      id: 'price',
                      header: 'Precio',
                      content: (item: any) => `$${item.price.toFixed(2)}`
                    },
                    {
                      id: 'description',
                      header: 'Descripción',
                      content: (item: any) => item.description || 'Sin descripción'
                    }
                  ]
                }}
                cardsPerRow={[
                  { cards: 1 },
                  { minWidth: 500, cards: 2 }
                ]}
                items={selectedOrder.items}
                loadingText="Cargando productos..."
                empty="No hay productos en este pedido"
              />

              <Box>
                <SpaceBetween size="m">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Cliente:</strong> {selectedOrder.customerName}
                    </div>
                    <div>
                      <strong>Email:</strong> {selectedOrder.customerEmail}
                    </div>
                    <div>
                      <strong>Total:</strong> ${selectedOrder.total.toFixed(2)}
                    </div>
                    <div>
                      <strong>Estado:</strong> 
                      <StatusIndicator type={getStatusColor(selectedOrder.status)}>
                        {getStatusText(selectedOrder.status)}
                      </StatusIndicator>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div>
                        <strong>Número de Seguimiento:</strong> {selectedOrder.trackingNumber}
                      </div>
                    )}
                    {selectedOrder.estimatedDelivery && (
                      <div>
                        <strong>Entrega Estimada:</strong> {selectedOrder.estimatedDelivery.toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div>
                    <strong>Actualizar Estado:</strong>
                    <SpaceBetween size="s" direction="horizontal">
                                             <Select
                         selectedOption={statusOptions.find(opt => opt.value === selectedStatus) || null}
                         onChange={({ detail }) => setSelectedStatus(detail.selectedOption.value as OrderStatus)}
                         options={statusOptions}
                         placeholder="Seleccionar estado"
                       />
                      <Button
                        variant="primary"
                        onClick={() => handleStatusUpdate(selectedOrder.id)}
                      >
                        Actualizar
                      </Button>
                    </SpaceBetween>
                  </div>
                </SpaceBetween>
              </Box>
            </SpaceBetween>
          </Modal>
        )}
      </SpaceBetween>
    </Container>
  );
} 