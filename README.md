# Nova Sonic Web App - Frontend

Aplicación web completa desarrollada con Next.js 14 que incluye chat en tiempo real con Nova Sonic, seguimiento de pedidos y gestión de citas médicas.

## 🚀 Características Principales

### Chat con Nova Sonic S2S
- **Chat en tiempo real** con WebSocket
- **Grabación de audio** con transcripción automática
- **Interfaz intuitiva** con mensajes en tiempo real
- **Indicadores de estado** de conexión y grabación
- **Reproducción de audio** de respuestas de Nova Sonic
- **Configuración avanzada** de voz y prompts

### Seguimiento de Pedidos
- **Lista de pedidos** con estados en tiempo real
- **Detalles completos** de cada pedido
- **Actualización de estados** (Pendiente, Procesando, Enviado, Entregado, Cancelado)
- **Historial de cambios** de estado
- **Información de seguimiento** y entrega estimada
- **Filtros y búsqueda** avanzada

### Calendario de Citas
- **Calendario interactivo** usando Cloudscape Design
- **Gestión de citas médicas** con diferentes tipos
- **Creación y edición** de citas
- **Vista detallada** por fecha
- **Estados de citas** (Programada, Confirmada, Cancelada, Completada)
- **Formularios inteligentes** con validación

## 🛠️ Tecnologías Utilizadas

### Frontend Framework
- **Next.js 14** - Framework de React con App Router
- **TypeScript** - Tipado estático
- **React 18** - Biblioteca de UI

### Styling y UI
- **Tailwind CSS** - Framework de CSS utility-first
- **Cloudscape Design** - Sistema de diseño de AWS
- **PostCSS** - Procesamiento de CSS

### State Management
- **Zustand** - Gestión de estado global
- **React Hooks** - Hooks personalizados

### Comunicación
- **WebSocket** - Comunicación en tiempo real
- **Fetch API** - Requests HTTP a API Gateway

### Audio Processing
- **Web Audio API** - Procesamiento de audio
- **AudioWorklet** - Procesamiento de audio en background
- **MediaRecorder API** - Grabación de audio

## 📦 Instalación y Configuración

### Prerequisites
- Node.js 18+
- npm o yarn
- Acceso a backend Nova Sonic

### Setup

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd nova-sonic-web-app
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env.local
   cp .env.example .env.local
   
   # Editar variables
   NEXT_PUBLIC_API_GATEWAY_URL=https://your-api-gateway-url.amazonaws.com
   NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8081
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🏗️ Estructura del Proyecto

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Layout principal con estilos de Cloudscape
│   ├── page.tsx             # Página principal con navegación
│   ├── globals.css          # Estilos globales
│   └── favicon.ico          # Favicon
├── components/              # Componentes React
│   ├── SideNavigation.tsx   # Navegación lateral
│   ├── ChatInterface.tsx    # Interfaz de chat con Nova Sonic
│   ├── PedidosInterface.tsx # Interfaz de pedidos
│   ├── CalendarInterface.tsx # Interfaz de calendario
│   ├── EventDisplay.tsx     # Display de eventos
│   ├── Meter.tsx            # Indicador de audio
│   ├── SmartSearch.tsx      # Búsqueda inteligente
│   ├── ThemeProvider.tsx    # Proveedor de tema
│   ├── ThemeToggle.tsx      # Toggle de tema
│   └── ThemeWrapper.tsx     # Wrapper de tema
├── helper/                  # Utilidades y helpers
│   ├── audioHelper.js       # Utilidades de audio
│   ├── audioPlayer.js       # Reproductor de audio
│   ├── audioPlayerProcessor.worklet.js # Worklet para reproducción
│   ├── audioRecorderProcessor.worklet.js # Worklet para grabación
│   └── s2sEvents.js         # Eventos S2S para Nova Sonic
├── hooks/                   # Hooks personalizados
│   ├── useAudioRecorder.ts  # Hook para grabación de audio
│   └── useNovaSonicAudio.ts # Hook para audio de Nova Sonic
├── lib/                     # Librerías y utilidades
│   ├── api-config.ts        # Configuración de API
│   ├── api.ts               # Servicio de API
│   ├── store.ts             # Estado global con Zustand
│   └── websocket.ts         # Gestión de WebSocket
├── types/                   # Tipos TypeScript
│   ├── index.ts             # Interfaces principales
│   └── speech.d.ts          # Tipos para Web Speech API
└── static/                  # Assets estáticos
    ├── ai_chat_icon.svg     # Icono de chat AI
    ├── delete.png           # Icono de eliminar
    ├── demo.jpg             # Imagen de demo
    └── kb-customer-avatar.svg # Avatar de cliente
```

## 🎯 Componentes Principales

### ChatInterface.tsx

**Propósito**: Interfaz principal para chat de voz con Nova Sonic S2S

**Funcionalidades**:
- **Grabación de audio**: Captura audio del micrófono en tiempo real
- **WebSocket communication**: Envía audio chunks al backend Nova Sonic
- **Reproducción de audio**: Reproduce respuestas de audio de Nova Sonic
- **Transcripción**: Muestra transcripción en tiempo real
- **Estado de conexión**: Indicadores visuales de estado
- **Configuración**: Panel de configuración de voz y prompts

**Props y Estado**:
```typescript
interface ChatInterfaceProps {
  // No props externos
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  generationStage?: string;
}
```

**Hooks Utilizados**:
- `useNovaSonicAudio`: Hook personalizado para audio
- `useState`: Estado local de mensajes y configuración
- `useEffect`: Efectos de ciclo de vida
- `useRef`: Referencias a elementos DOM

### PedidosInterface.tsx

**Propósito**: Interfaz para gestión y visualización de pedidos

**Funcionalidades**:
- **Tabla de pedidos**: Lista paginada con filtros
- **Detalles de pedido**: Modal con información completa
- **Estados visuales**: Indicadores de color por estado
- **Búsqueda**: Filtrado por cliente, estado, fecha
- **Información de seguimiento**: Tracking numbers y fechas estimadas

**Props y Estado**:
```typescript
interface PedidosInterfaceProps {
  // No props externos
}

interface Order {
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
```

**Integración con API**:
- Usa `apiService.getOrders()` para cargar datos
- Fallback a datos mock si API no está disponible
- Manejo de errores con try-catch

### CalendarInterface.tsx

**Propósito**: Interfaz para gestión de citas médicas

**Funcionalidades**:
- **Calendario interactivo**: Vista de calendario con Cloudscape
- **Vista de citas**: Lista de citas por fecha seleccionada
- **Creación de citas**: Formulario completo con validación
- **Tipos de cita**: Diferentes categorías (consulta, seguimiento, emergencia, rutina)
- **Estados de cita**: Gestión de estados (programada, confirmada, cancelada, completada)

**Props y Estado**:
```typescript
interface CalendarInterfaceProps {
  // No props externos
}

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  date: Date;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
}
```

**Integración con API**:
- Usa `apiService.getAppointments()` y `apiService.getAppointmentsByDate()`
- Fallback a datos mock si API no está disponible
- Formularios con validación de campos

### SideNavigation.tsx

**Propósito**: Navegación lateral entre secciones

**Funcionalidades**:
- **Navegación**: Cambio entre Chat, Pedidos y Calendario
- **Indicadores activos**: Resalta sección actual
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Accesibilidad**: Navegación por teclado

### EventDisplay.tsx

**Propósito**: Display de eventos y mensajes del sistema

**Funcionalidades**:
- **Eventos en tiempo real**: Muestra eventos de WebSocket
- **Estados de conexión**: Indicadores de estado
- **Logs de debug**: Información de debugging
- **Auto-scroll**: Scroll automático a nuevos eventos

### Meter.tsx

**Propósito**: Indicador visual de nivel de audio

**Funcionalidades**:
- **Visualización de audio**: Muestra nivel de audio en tiempo real
- **Animación**: Barras animadas según nivel
- **Configuración**: Sensibilidad ajustable
- **Responsive**: Se adapta al tamaño del contenedor

## 🔧 Helpers y Utilidades

### audioHelper.js

**Propósito**: Utilidades para procesamiento de audio

**Funciones Principales**:
```javascript
function base64ToFloat32Array(base64String) {
  // Convierte string base64 a Float32Array para Web Audio API
  // Usado para reproducir audio de Nova Sonic
}
```

**Uso**:
- Conversión de audio base64 a formato compatible con Web Audio API
- Procesamiento de respuestas de audio de Nova Sonic
- Optimización de rendimiento de audio

### audioPlayer.js

**Propósito**: Clase para reproducción de audio

**Funcionalidades**:
- **Inicialización**: Setup de AudioContext y AudioWorklet
- **Reproducción**: Play audio samples en tiempo real
- **Barge-in**: Interrupción de audio actual
- **Cleanup**: Limpieza de recursos de audio

**Métodos Principales**:
```javascript
class AudioPlayer {
  async start()           // Inicializar reproductor
  playAudio(samples)      // Reproducir audio
  bargeIn()              // Interrumpir audio actual
  stop()                 // Detener y limpiar
}
```

### audioPlayerProcessor.worklet.js

**Propósito**: AudioWorklet para reproducción de audio

**Funcionalidades**:
- **Procesamiento de audio**: Manejo de samples de audio
- **Buffer circular**: Optimización de memoria
- **Barge-in**: Interrupción inmediata de audio
- **Sincronización**: Timing preciso de audio

### audioRecorderProcessor.worklet.js

**Propósito**: AudioWorklet para grabación de audio

**Funcionalidades**:
- **Captura de audio**: Grabación en tiempo real
- **Chunking**: División en chunks para streaming
- **Formato**: Conversión a formato compatible con Nova Sonic
- **Optimización**: Buffer optimizado para latencia mínima

### s2sEvents.js

**Propósito**: Generación de eventos S2S para Nova Sonic

**Funcionalidades**:
- **Eventos estándar**: Generación de eventos S2S
- **Configuración**: Configuración de audio y prompts
- **Tools**: Definición de herramientas disponibles
- **System prompt**: Prompt optimizado para el asistente

**Eventos Principales**:
```javascript
class S2sEvent {
  static sessionStart()           // Inicio de sesión
  static promptStart()            // Inicio de prompt
  static audioInput()             // Entrada de audio
  static textInput()              // Entrada de texto
  static contentStart()           // Inicio de contenido
  static contentEnd()             // Fin de contenido
  static promptEnd()              // Fin de prompt
  static sessionEnd()             // Fin de sesión
}
```

## 🎣 Hooks Personalizados

### useNovaSonicAudio.ts

**Propósito**: Hook para manejo de audio con Nova Sonic

**Funcionalidades**:
- **Grabación**: Captura de audio del micrófono
- **WebSocket**: Envío de audio al backend
- **Estado**: Control de estado de grabación y conexión
- **Error handling**: Manejo de errores de audio

**Retorno**:
```typescript
interface UseNovaSonicAudioReturn {
  isRecording: boolean;
  isConnected: boolean;
  startRecording: (promptName: string, audioContentName: string) => Promise<void>;
  stopRecording: () => Promise<void>;
  error: string | null;
}
```

**Uso**:
```typescript
const { isRecording, isConnected, startRecording, stopRecording, error } = useNovaSonicAudio();
```

### useAudioRecorder.ts

**Propósito**: Hook para grabación básica de audio

**Funcionalidades**:
- **Grabación simple**: Captura de audio sin WebSocket
- **Formato**: Conversión a diferentes formatos
- **Estado**: Control de estado de grabación
- **Callbacks**: Callbacks para eventos de grabación

## 📚 Librerías y Utilidades

### store.ts (Zustand)

**Propósito**: Estado global de la aplicación

**Estado Principal**:
```typescript
interface AppState {
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
}
```

**Acciones Principales**:
- `addMessage`: Agregar mensaje al chat
- `setOrders`: Actualizar lista de pedidos
- `setAppointments`: Actualizar lista de citas
- `executeTool`: Ejecutar herramienta de Nova Sonic
- `setCurrentView`: Cambiar vista actual

### websocket.ts

**Propósito**: Gestión de conexión WebSocket

**Funcionalidades**:
- **Conexión**: Gestión de conexión WebSocket
- **Reconexión**: Reconexión automática en caso de desconexión
- **Mensajes**: Envío y recepción de mensajes
- **Eventos**: Callbacks para eventos de conexión

**Métodos Principales**:
```typescript
class WebSocketManager {
  connect(): Promise<void>           // Conectar al WebSocket
  disconnect(): void                 // Desconectar
  send(message: WebSocketMessage): void // Enviar mensaje
  onMessage(callback): void          // Callback para mensajes
  onConnect(callback): void          // Callback para conexión
  onDisconnect(callback): void       // Callback para desconexión
}
```

### api.ts

**Propósito**: Servicio para comunicación con API Gateway

**Funcionalidades**:
- **HTTP requests**: Requests a endpoints REST
- **Error handling**: Manejo robusto de errores
- **Date formatting**: Formateo de fechas para Argentina
- **Fallback**: Datos mock si API no está disponible

**Métodos Principales**:
```typescript
class ApiService {
  getOrders(): Promise<Order[]>                    // Obtener pedidos
  getOrderById(orderId: string): Promise<Order>    // Obtener pedido específico
  getAppointments(): Promise<Appointment[]>        // Obtener citas
  getAppointmentsByDate(date: Date): Promise<Appointment[]> // Obtener citas por fecha
}
```

### api-config.ts

**Propósito**: Configuración de URLs de API

**Funcionalidades**:
- **URLs dinámicas**: URLs basadas en variables de entorno
- **Fallbacks**: URLs por defecto para desarrollo
- **Validación**: Validación de URLs configuradas

## 📝 Tipos TypeScript

### index.ts

**Tipos Principales**:
```typescript
// Chat Types
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'nova-sonic';
  timestamp: Date;
  audioUrl?: string;
  transcribed?: boolean;
}

// Order Types
interface Order {
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

// Appointment Types
interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  date: Date;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  notes?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
}

// WebSocket Types
interface WebSocketMessage {
  type: 'chat' | 'order_update' | 'appointment_update' | 'audio_transcription' | 'audio_response' | 'transcription_complete' | 'nova_speaking' | 'nova_silent' | 'tool_execution' | 'tool_result' | 'session_started' | 'session_ended' | 'nova_response' | 'transcription' | 'error' | 'audio_chunk' | 'start_session' | 'end_session' | 's2s_event';
  payload: any;
  timestamp: Date;
}

// Voice Session Types
interface VoiceSession {
  isListening: boolean;
  isProcessing: boolean;
  userTranscription: string;
  novaResponse: string;
  confidence: number;
}

// Tool Execution Types
interface ToolExecution {
  toolName: string;
  parameters: any;
  result?: any;
  success: boolean;
  message: string;
}
```

### speech.d.ts

**Tipos para Web Speech API**:
```typescript
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}
```

## ⚙️ Configuración de Next.js

### next.config.ts

**Configuración Principal**:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Configuración por defecto de Next.js 14
  // Se pueden agregar configuraciones específicas aquí
};

export default nextConfig;
```

**Configuraciones Disponibles**:
- **App Router**: Habilitado por defecto
- **TypeScript**: Configurado automáticamente
- **ESLint**: Configurado con reglas personalizadas
- **PostCSS**: Configurado para Tailwind CSS

### ESLint Configuration

**eslint.config.mjs**:
```javascript
import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // Reglas personalizadas
    },
  },
];
```

### PostCSS Configuration

**postcss.config.mjs**:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## 🎨 Styling y UI

**Tailwind CSS**:
- **Utility-first**: Clases CSS utilitarias
- **Responsive**: Diseño responsive por defecto
- **Custom colors**: Colores personalizados para el tema
- **Dark mode**: Soporte para modo oscuro

**Cloudscape Design**:
- **Componentes**: Box, Button, Container, Header, SpaceBetween, StatusIndicator, Table, Modal, Form, Calendar, Cards
- **Tema**: Light/Dark, diseño consistente, componentes accesibles

## 📱 Responsive Design

**Breakpoints (Tailwind CSS)**:
- **sm**: 640px y superior
- **md**: 768px y superior
- **lg**: 1024px y superior
- **xl**: 1280px y superior
- **2xl**: 1536px y superior

**Adaptaciones por Dispositivo**:
- **Desktop (>1024px)**: Navegación lateral visible, tablas completas, calendario full
- **Tablet (768px-1024px)**: Navegación colapsable, tablas principales, calendario adaptado
- **Mobile (<768px)**: Hamburger menu, tablas en tarjetas, calendario en lista, chat full-screen

## 🚀 Despliegue

### Vercel (Recomendado)

1. **Configurar proyecto en Vercel**
   ```bash
   npm run build
   vercel --prod
   ```

2. **Variables de entorno en Vercel**
   ```env
   NEXT_PUBLIC_API_GATEWAY_URL=https://your-api-gateway-url.amazonaws.com
   NEXT_PUBLIC_WEBSOCKET_URL=wss://your-websocket-url.com
   ```

### Otros proveedores

1. **Build de producción**
   ```bash
   npm run build
   ```

2. **Iniciar servidor**
   ```bash
   npm start
   ```

### Variables de Entorno

**Desarrollo (.env.local)**:
```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3001
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8081
```

**Producción**:
```env
NEXT_PUBLIC_API_GATEWAY_URL=https://your-api-gateway-url.amazonaws.com
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-websocket-url.com
```

## 🚧 Estado Actual del Proyecto

### ✅ Completado

1. **Interfaz de Usuario**
   - Componentes principales implementados
   - Diseño responsive con Cloudscape
   - Navegación entre secciones
   - Temas claro/oscuro

2. **Chat Interface**
   - Grabación de audio funcional
   - WebSocket connection estable
   - Reproducción de audio de Nova Sonic
   - Transcripción en tiempo real
   - Configuración de voz

3. **Orders Interface**
   - Tabla de pedidos con filtros
   - Detalles de pedido en modal
   - Estados visuales
   - Integración con API Gateway
   - Fallback a datos mock

4. **Calendar Interface**
   - Calendario interactivo
   - Gestión de citas
   - Formularios de creación
   - Integración con API Gateway
   - Fallback a datos mock

5. **State Management**
   - Zustand store configurado
   - Hooks personalizados
   - Gestión de estado global
   - Persistencia de datos

6. **Audio Processing**
   - Web Audio API implementado
   - AudioWorklets para grabación y reproducción
   - Optimización de buffers
   - Manejo de errores de audio

### 🚧 En Desarrollo

1. **Integración WebSocket**
   - Conexión estable con backend
   - Envío de audio chunks
   - Recepción de respuestas
   - **Obstáculo**: Sincronización de audio bidireccional

### 🚨 Último Obstáculo

**Problema**: Sincronización completa de audio entre frontend y Nova Sonic

**Detalles**:
- La grabación de audio funciona correctamente
- El WebSocket envía audio chunks al backend
- Nova Sonic procesa y responde
- **Obstáculo**: La reproducción de audio de respuesta tiene latencia y ocasionalmente se pierden chunks

**Síntomas**:
- Audio de respuesta se reproduce con delay
- Ocasionalmente se corta el audio
- Buffer de audio no optimizado para streaming
- Latencia en la comunicación WebSocket

**Causa Raíz**:
- Timing entre envío y recepción de audio chunks
- Buffer de audio no optimizado para tiempo real
- Latencia de red entre frontend y servidor WebSocket
- Falta de acknowledgment system para chunks

**Solución en Progreso**:
- Optimización del buffer circular en AudioWorklet
- Implementación de acknowledgment system
- Reducción de tamaño de chunks de audio
- Mejora en el manejo de timing de WebSocket

### 📋 Próximos Pasos

1. **Optimizar Audio Streaming**
   - Implementar buffer circular optimizado
   - Reducir latencia de audio chunks
   - Mejorar sincronización audio/texto
   - Implementar acknowledgment system

2. **Testing y QA**
   - Tests unitarios para componentes
   - Tests de integración WebSocket
   - Tests de rendimiento de audio
   - Tests de accesibilidad


**Nova Sonic Web App** - Frontend completo para aplicaciones de voz 🚀
