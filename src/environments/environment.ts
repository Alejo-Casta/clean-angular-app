/**
 * Environment configuration for development
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  useMockData: true, // Set to false when real API is available
  appName: 'Clean Angular App',
  version: '1.0.0',
  features: {
    enableLogging: true,
    enableAnalytics: false,
    enableErrorReporting: true,
  },
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
};
