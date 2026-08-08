// Centralized config file
export const config = {
  api: {
    url: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 30000,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'MeetingROI',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
  features: {
    enableAI: import.meta.env.VITE_ENABLE_AI === 'true',
    enablePowerBI: import.meta.env.VITE_ENABLE_POWERBI === 'false',
  },
};

export default config;