// Configuration file for API endpoints and environment variables
export const apiConfig = {
  // API Gateway URL for REST endpoints (PedidosInterface and CalendarInterface)
  apiGatewayUrl: 'https://4y57g84n59.execute-api.us-east-1.amazonaws.com/demo',
  
  // WebSocket URL for real-time communication (ChatInterface)
  websocketUrl: 'ws://localhost:8081',
  
  // API endpoints
  endpoints: {
    orders: '/orders',
    appointments: '/appointments',
    chat: '/chat'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${apiConfig.apiGatewayUrl}${endpoint}`;
};

// Helper function to get WebSocket URL
export const getWebSocketUrl = (): string => {
  return apiConfig.websocketUrl;
}; 