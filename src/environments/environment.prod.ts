/**
 * Environment configuration for production
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api',
  useMockData: false,
  appName: 'Clean Angular App',
  version: '1.0.0',
  features: {
    enableLogging: false,
    enableAnalytics: true,
    enableErrorReporting: true,
  },
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
};
