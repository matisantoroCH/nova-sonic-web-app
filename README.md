# Nova Sonic - Aplicación Web

Una aplicación web completa desarrollada con Next.js 14 que incluye chat en tiempo real, seguimiento de pedidos y gestión de citas médicas.

## 🚀 Características

### Chat con Nova Sonic
- **Chat en tiempo real** con WebSocket
- **Grabación de audio** con transcripción automática
- **Interfaz intuitiva** con mensajes en tiempo real
- **Indicadores de estado** de conexión

### Seguimiento de Pedidos
- **Lista de pedidos** con estados en tiempo real
- **Detalles completos** de cada pedido
- **Actualización de estados** (Pendiente, Procesando, Enviado, Entregado, Cancelado)
- **Historial de cambios** de estado
- **Información de seguimiento** y entrega estimada

### Calendario de Citas
- **Calendario interactivo** usando Cloudscape Design
- **Gestión de citas médicas** con diferentes tipos
- **Creación y edición** de citas
- **Vista detallada** por fecha
- **Estados de citas** (Programada, Confirmada, Cancelada, Completada)

## 🛠️ Tecnologías Utilizadas

- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS
- **Cloudscape Design** - Sistema de diseño de AWS
- **Zustand** - Gestión de estado global
- **WebSocket** - Comunicación en tiempo real

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd nova-sonic-web-app
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── layout.tsx          # Layout principal con estilos de Cloudscape
│   ├── page.tsx            # Página principal con navegación
│   └── globals.css         # Estilos globales
├── components/
│   ├── SideNavigation.tsx  # Navegación lateral
│   ├── ChatInterface.tsx   # Interfaz de chat
│   ├── PedidosInterface.tsx # Interfaz de pedidos
│   └── CalendarInterface.tsx # Interfaz de calendario
├── lib/
│   ├── store.ts            # Estado global con Zustand
│   └── websocket.ts        # Gestión de WebSocket
├── hooks/
│   └── useAudioRecorder.ts # Hook para grabación de audio
└── types/
    └── index.ts            # Interfaces TypeScript
```

## 🎯 Funcionalidades Principales

### Chat Interface
- **Mensajes en tiempo real** entre usuario y Nova Sonic
- **Grabación de audio** con transcripción automática
- **Indicadores de estado** (grabando, transcribiendo, conectado)
- **Auto-scroll** a nuevos mensajes
- **Reproducción de audio** de mensajes grabados

### Orders Interface
- **Tabla de pedidos** con información completa
- **Modal de detalles** con productos y estado
- **Visualización de estados** (solo lectura)
- **Información de seguimiento** y entrega
- **Carga de datos** desde API Gateway

### Calendar Interface
- **Calendario interactivo** de Cloudscape Design
- **Vista de citas** por fecha seleccionada
- **Creación de nuevas citas** con formulario completo
- **Diferentes tipos** de citas (consulta, seguimiento, emergencia, rutina)
- **Carga de datos** desde API Gateway

## 🔧 Configuración

### Variables de Entorno
La aplicación utiliza variables de entorno para configurar las URLs de conexión. Crea un archivo `.env.local` en la raíz del proyecto:

```env
# API Gateway Configuration
NEXT_PUBLIC_API_GATEWAY_URL=https://your-api-gateway-url.amazonaws.com

# WebSocket Configuration (for ChatInterface)
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080
```

### Configuración de API
- **PedidosInterface** y **CalendarInterface** usan HTTP requests al API Gateway
- **ChatInterface** usa WebSocket para comunicación en tiempo real
- Si la API no está disponible, se usan datos mock como fallback

Para más detalles sobre la configuración, consulta [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md).

### Estado Global
El estado se gestiona con Zustand y incluye:
- Mensajes del chat
- Lista de pedidos
- Citas del calendario
- Estado de la UI
- Configuración de WebSocket

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- **Desktop** - Vista completa con navegación lateral
- **Tablet** - Diseño adaptativo
- **Mobile** - Navegación optimizada para touch

## 🎨 Diseño

Utiliza **Cloudscape Design System** de AWS para:
- **Consistencia visual** en toda la aplicación
- **Componentes accesibles** y bien probados
- **Temas adaptables** (claro/oscuro)
- **Iconografía coherente**

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
npm run build
vercel --prod
```

### Otros proveedores
```bash
npm run build
npm start
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación de Cloudscape Design

---

**Nova Sonic** - Transformando la experiencia digital 🚀
