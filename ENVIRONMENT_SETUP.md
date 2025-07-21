# Configuración de Variables de Entorno

Este documento explica cómo configurar las variables de entorno necesarias para el funcionamiento de Nova Sonic Web App.

## Variables Requeridas

### 1. API Gateway URL
Para que `PedidosInterface` y `CalendarInterface` funcionen correctamente, necesitas configurar la URL de tu API Gateway.

```bash
# Crear archivo .env.local en la raíz del proyecto
NEXT_PUBLIC_API_GATEWAY_URL=https://tu-api-gateway-url.amazonaws.com
```

### 2. WebSocket URL
Para que `ChatInterface` funcione con comunicación en tiempo real, configura la URL del WebSocket.

```bash
# En el mismo archivo .env.local
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080
```

## Configuración Completa

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# API Gateway Configuration
NEXT_PUBLIC_API_GATEWAY_URL=https://your-api-gateway-url.amazonaws.com

# WebSocket Configuration (for ChatInterface)
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080
```

## Estructura de Endpoints Esperados

### API Gateway Endpoints

El backend debe exponer los siguientes endpoints a través del API Gateway:

#### Orders Endpoints
- `GET /orders` - Obtener lista de pedidos
- `GET /orders/{id}` - Obtener pedido específico

#### Appointments Endpoints
- `GET /appointments` - Obtener lista de citas
- `GET /appointments?date={YYYY-MM-DD}` - Obtener citas por fecha
- `GET /appointments/{id}` - Obtener cita específica

### WebSocket Endpoints

El WebSocket debe manejar los siguientes tipos de mensajes:
- `chat` - Mensajes de chat
- `audio_transcription` - Transcripción de audio
- `audio_response` - Respuesta de audio
- `transcription_complete` - Transcripción completada
- `nova_speaking` - Nova está hablando
- `nova_silent` - Nova está en silencio

## Fallback Behavior

Si la API no está disponible o falla:
- `PedidosInterface` usará datos mock locales
- `CalendarInterface` usará datos mock locales
- `ChatInterface` mostrará un mensaje de error de conexión

## Desarrollo Local

Para desarrollo local, puedes usar:

```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3001
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080
```

## Producción

Para producción, asegúrate de:

1. Configurar las URLs correctas de tu API Gateway
2. Configurar la URL correcta de tu WebSocket
3. Verificar que los endpoints estén disponibles y funcionando
4. Configurar CORS si es necesario

## Verificación

Para verificar que la configuración es correcta:

1. Ejecuta `npm run dev`
2. Abre la aplicación en el navegador
3. Navega a la sección de Pedidos
4. Verifica que los datos se cargan desde la API
5. Navega a la sección de Calendario
6. Verifica que las citas se cargan desde la API
7. Navega a la sección de Chat
8. Verifica que la conexión WebSocket funciona

## Troubleshooting

### Error: "API request failed"
- Verifica que la URL del API Gateway es correcta
- Verifica que el API Gateway está funcionando
- Verifica que los endpoints están configurados correctamente

### Error: "WebSocket connection failed"
- Verifica que la URL del WebSocket es correcta
- Verifica que el servidor WebSocket está funcionando
- Verifica que el puerto está abierto y accesible

### Datos no se cargan
- Verifica la consola del navegador para errores
- Verifica que las variables de entorno están configuradas
- Verifica que el archivo `.env.local` está en la raíz del proyecto 