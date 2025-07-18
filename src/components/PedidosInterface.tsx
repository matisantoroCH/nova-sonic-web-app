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
  Badge,
  TextFilter,
  Pagination,
  CollectionPreferences,
  Link
} from '@cloudscape-design/components';
import useAppStore from '@/lib/store';
import { Order, OrderStatus } from '@/types';
import Swal from 'sweetalert2';

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
  },
  {
    id: '4',
    customerName: 'Ana Rodríguez',
    customerEmail: 'ana.rodriguez@email.com',
    items: [
      { id: '6', name: 'Producto F', quantity: 1, price: 89.99, description: 'Descripción del producto F' }
    ],
    total: 89.99,
    status: 'delivered',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    trackingNumber: 'TRK456789123'
  },
  {
    id: '5',
    customerName: 'Luis Martínez',
    customerEmail: 'luis.martinez@email.com',
    items: [
      { id: '7', name: 'Producto G', quantity: 2, price: 32.50, description: 'Descripción del producto G' },
      { id: '8', name: 'Producto H', quantity: 1, price: 18.75, description: 'Descripción del producto H' }
    ],
    total: 83.75,
    status: 'cancelled',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-09')
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
  const [selectedItems, setSelectedItems] = useState<Order[]>([]);
  const [filteringText, setFilteringText] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columnDisplay, setColumnDisplay] = useState([
    { id: 'id', visible: true },
    { id: 'customerName', visible: true },
    { id: 'customerEmail', visible: true },
    { id: 'total', visible: true },
    { id: 'status', visible: true },
    { id: 'createdAt', visible: true },
    { id: 'itemsCount', visible: true },
    { id: 'actions', visible: true }
  ]);
  const [sortingColumn, setSortingColumn] = useState('createdAt');
  const [sortingDescending, setSortingDescending] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load mock data
    setOrders(mockOrders);
  }, [setOrders]);

  const handleStatusUpdate = (orderId: string) => {
    updateOrderStatus(orderId, selectedStatus);
    setIsModalVisible(false);
  };

  const handleCreateOrder = () => {
    // TODO: Implement order creation
    console.log('Crear nuevo pedido');
  };

  const tableItems = orders.map(order => ({
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    trackingNumber: order.trackingNumber,
    estimatedDelivery: order.estimatedDelivery,
    itemsCount: order.items.length
  }));

  const columnDefinitions = [
    {
      id: 'id',
      header: 'ID Pedido',
      cell: (item: any) => (
        <Link href="#" onFollow={() => {
          const order = orders.find(o => o.id === item.id);
          if (order) {
            selectOrder(order);
            setIsModalVisible(true);
          }
        }}>
          {item.id}
        </Link>
      ),
      sortingField: 'id',
      isRowHeader: true
    },
    {
      id: 'customerName',
      header: 'Cliente',
      cell: (item: any) => item.customerName,
      sortingField: 'customerName'
    },
    {
      id: 'customerEmail',
      header: 'Email',
      cell: (item: any) => item.customerEmail,
      sortingField: 'customerEmail'
    },
    {
      id: 'total',
      header: 'Total',
      cell: (item: any) => `$${item.total.toFixed(2)}`,
      sortingField: 'total'
    },
    {
      id: 'status',
      header: 'Estado',
      cell: (item: any) => (
        <StatusIndicator type={getStatusColor(item.status)}>
          {getStatusText(item.status)}
        </StatusIndicator>
      ),
      sortingField: 'status'
    },
    {
      id: 'createdAt',
      header: 'Fecha Creación',
      cell: (item: any) => item.createdAt.toLocaleDateString('es-ES'),
      sortingField: 'createdAt'
    },
    {
      id: 'itemsCount',
      header: 'Productos',
      cell: (item: any) => `${item.itemsCount} items`,
      sortingField: 'itemsCount'
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: (item: any) => (
        <Button
          variant="icon"
          iconName="external"
          onClick={() => {
            const order = orders.find(o => o.id === item.id);
            if (order) {
              selectOrder(order);
              setIsModalVisible(true);
            }
          }}
          ariaLabel="Ver detalles del pedido"
        />
      )
    }
  ];

  const filteredItems = tableItems.filter(item =>
    item.customerName.toLowerCase().includes(filteringText.toLowerCase()) ||
    item.customerEmail.toLowerCase().includes(filteringText.toLowerCase()) ||
    item.id.toLowerCase().includes(filteringText.toLowerCase()) ||
    getStatusText(item.status).toLowerCase().includes(filteringText.toLowerCase())
  );

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    let aValue: any = a[sortingColumn as keyof typeof a];
    let bValue: any = b[sortingColumn as keyof typeof b];

    // Handle date sorting
    if (sortingColumn === 'createdAt') {
      aValue = aValue.getTime();
      bValue = bValue.getTime();
    }

    // Handle string sorting
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortingDescending ? 1 : -1;
    }
    if (aValue > bValue) {
      return sortingDescending ? -1 : 1;
    }
    return 0;
  });

  const pagesCount = Math.ceil(sortedItems.length / pageSize);
  const startIndex = (currentPageIndex - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentItems = sortedItems.slice(startIndex, endIndex);

  return (
    <Container>
      <div className="mb-8">
        <Header
          variant="h1"
          description="Gestión y seguimiento de pedidos con filtrado avanzado y paginación"
        >
          Seguimiento de Pedidos
        </Header>
      </div>

      <div className="space-y-6">
        <Table
          renderAriaLive={({
            firstIndex,
            lastIndex,
            totalItemsCount
          }) =>
            `Mostrando pedidos ${firstIndex} a ${lastIndex} de ${totalItemsCount}`
          }
          onSelectionChange={({ detail }) =>
            setSelectedItems(detail.selectedItems)
          }
          onSortingChange={({ detail }) => {
            setSortingColumn(detail.sortingColumn.sortingField || 'createdAt');
            setSortingDescending(detail.isDescending ?? true);
          }}
          selectedItems={selectedItems}
          ariaLabels={{
            selectionGroupLabel: "Selección de pedidos",
            allItemsSelectionLabel: () => "seleccionar todos",
            itemSelectionLabel: ({ selectedItems }, item) =>
              `Pedido ${item.id}`
          }}
          columnDefinitions={columnDefinitions}
          columnDisplay={columnDisplay}
          enableKeyboardNavigation
          items={currentItems}
          loading={isLoading}
          loadingText="Cargando pedidos..."
          selectionType="multi"
          trackBy="id"
          resizableColumns
          sortingColumn={{
            sortingField: sortingColumn
          }}
          sortingDescending={sortingDescending}
          empty={
            <Box
              margin={{ vertical: "xs" }}
              textAlign="center"
              color="inherit"
            >
              <SpaceBetween size="m">
                <b>No hay coincidencias</b>
                <Button 
                  variant="primary"
                  iconName="refresh"
                  onClick={() => setFilteringText('')}
                >
                  Limpiar filtro
                </Button>
              </SpaceBetween>
            </Box>
          }
          filter={
            <TextFilter
              filteringPlaceholder="Buscar pedidos..."
              filteringText={filteringText}
              onChange={({ detail }) => setFilteringText(detail.filteringText)}
              countText={`${filteredItems.length} coincidencias`}
            />
          }
          header={
            <Header
              counter={
                selectedItems.length
                  ? `(${selectedItems.length}/${filteredItems.length})`
                  : `(${filteredItems.length})`
              }
            >
              Lista de Pedidos
            </Header>
          }
          pagination={
            <Pagination 
              currentPageIndex={currentPageIndex} 
              pagesCount={pagesCount}
              onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
            />
          }
          preferences={
            <CollectionPreferences
              title="Preferencias de tabla"
              confirmLabel="Confirmar"
              cancelLabel="Cancelar"
              preferences={{
                pageSize: pageSize,
                contentDisplay: columnDisplay
              }}
              onConfirm={({ detail }) => {
                if (detail.pageSize) {
                  setPageSize(detail.pageSize);
                }
                if (detail.contentDisplay) {
                  setColumnDisplay([...detail.contentDisplay]);
                }
              }}
              pageSizePreference={{
                title: "Tamaño de página",
                options: [
                  { value: 5, label: "5 pedidos" },
                  { value: 10, label: "10 pedidos" },
                  { value: 20, label: "20 pedidos" }
                ]
              }}
              wrapLinesPreference={{
                label: "Ajustar líneas",
                description: "Ajustar el contenido de las celdas a múltiples líneas"
              }}
              stripedRowsPreference={{
                label: "Filas alternadas",
                description: "Mostrar filas con colores alternados"
              }}
              contentDensityPreference={{
                label: "Densidad de contenido",
                description: "Ajustar el espaciado del contenido"
              }}
              contentDisplayPreference={{
                title: "Columnas visibles",
                options: [
                  {
                    id: "id",
                    label: "ID Pedido",
                    alwaysVisible: true
                  },
                  { id: "customerName", label: "Cliente" },
                  { id: "customerEmail", label: "Email" },
                  { id: "total", label: "Total" },
                  { id: "status", label: "Estado" },
                  { id: "createdAt", label: "Fecha Creación" },
                  { id: "itemsCount", label: "Productos" },
                  { id: "actions", label: "Acciones" }
                ]
              }}
              stickyColumnsPreference={{
                firstColumns: {
                  title: "Fijar primeras columnas",
                  description:
                    "Mantener las primeras columnas visibles al hacer scroll horizontal.",
                  options: [
                    { label: "Ninguna", value: 0 },
                    { label: "Primera columna", value: 1 },
                    { label: "Primeras dos columnas", value: 2 }
                  ]
                },
                lastColumns: {
                  title: "Fijar última columna",
                  description:
                    "Mantener la última columna visible al hacer scroll horizontal.",
                  options: [
                    { label: "Ninguna", value: 0 },
                    { label: "Última columna", value: 1 }
                  ]
                }
              }}
            />
          }
        />

        {selectedOrder && (
          <Modal
            visible={isModalVisible}
            onDismiss={() => setIsModalVisible(false)}
            header="Detalles del Pedido"
            size="large"
          >
            <div className="space-y-8">
              {/* Información del Cliente y Pedido */}
              <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Header variant="h3" className="mb-6">
                  Información del Pedido
                </Header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <SpaceBetween size="m">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-semibold text-gray-700">Cliente:</span>
                      <span className="text-gray-900">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-semibold text-gray-700">Email:</span>
                      <span className="text-gray-900">{selectedOrder.customerEmail}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-semibold text-gray-700">Total:</span>
                      <span className="text-green-600 font-bold text-lg">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </SpaceBetween>
                  
                  <SpaceBetween size="m">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-semibold text-gray-700">Estado:</span>
                      <StatusIndicator type={getStatusColor(selectedOrder.status)}>
                        {getStatusText(selectedOrder.status)}
                      </StatusIndicator>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-gray-700">Número de Seguimiento:</span>
                        <span className="text-blue-600 font-mono">{selectedOrder.trackingNumber}</span>
                      </div>
                    )}
                    {selectedOrder.estimatedDelivery && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-gray-700">Entrega Estimada:</span>
                        <span className="text-gray-900">{selectedOrder.estimatedDelivery.toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                    )}
                  </SpaceBetween>
                </div>
              </div>

              {/* Productos del Pedido */}
              <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Header variant="h3" className="mb-6">
                  Productos ({selectedOrder.items.length})
                </Header>
                <Cards
                  cardDefinition={{
                    header: (item: any) => (
                      <div className="font-semibold text-lg text-gray-900">{item.name}</div>
                    ),
                    sections: [
                      {
                        id: 'quantity',
                        header: 'Cantidad',
                        content: (item: any) => (
                          <div className="text-center">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                              {item.quantity}
                            </span>
                          </div>
                        )
                      },
                      {
                        id: 'price',
                        header: 'Precio',
                        content: (item: any) => (
                          <div className="text-center">
                            <span className="text-green-600 font-bold text-lg">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                        )
                      },
                      {
                        id: 'description',
                        header: 'Descripción',
                        content: (item: any) => (
                          <div className="text-gray-600 italic">
                            {item.description || 'Sin descripción'}
                          </div>
                        )
                      }
                    ]
                  }}
                  cardsPerRow={[
                    { cards: 1 },
                    { minWidth: 500, cards: 2 }
                  ]}
                  items={selectedOrder.items.map((item, index) => ({ ...item, id: item.id || `item-${index}` }))}
                  loadingText="Cargando productos..."
                  empty="No hay productos en este pedido"
                />
              </div>

              {/* Actualizar Estado */}
              <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Header variant="h3" className="mb-6">
                  Actualizar Estado
                </Header>
                <SpaceBetween size="m" direction="horizontal">
                  <div className="flex-1">
                    <Select
                      selectedOption={statusOptions.find(opt => opt.value === selectedStatus) || null}
                      onChange={({ detail }) => setSelectedStatus(detail.selectedOption.value as OrderStatus)}
                      options={statusOptions}
                      placeholder="Seleccionar estado"
                    />
                  </div>
                  <Button
                    variant="primary"
                    iconName="refresh"
                    onClick={() => handleStatusUpdate(selectedOrder.id)}
                  >
                    Actualizar Estado
                  </Button>
                </SpaceBetween>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Container>
  );
} 