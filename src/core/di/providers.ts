import { Provider, ErrorHandler } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Domain interfaces
import { IUserRepository } from '../domain';

// Infrastructure implementations
import { UserRepository, UserMockRepository } from '../infrastructure';

// Shared services and interceptors
import { ErrorInterceptor, LoadingInterceptor } from '../../shared';
import { GlobalErrorHandlerService } from '../../shared/services/global-error-handler.service';

// Injection tokens
import {
  USER_REPOSITORY_TOKEN,
  API_CONFIG_TOKEN,
  APP_CONFIG_TOKEN,
} from './injection-tokens';

// Environment
import { environment } from '../../environments/environment';

/**
 * Core Providers Configuration
 * This file configures all the dependency injection providers following clean architecture principles
 */

/**
 * Repository Providers
 * Configure which repository implementation to use based on environment
 */
export const repositoryProviders: Provider[] = [
  {
    provide: USER_REPOSITORY_TOKEN,
    useClass: environment.useMockData ? UserMockRepository : UserRepository,
  },
];

/**
 * HTTP Interceptor Providers
 * Configure HTTP interceptors for cross-cutting concerns
 */
export const interceptorProviders: Provider[] = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: LoadingInterceptor,
    multi: true,
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true,
  },
];

/**
 * Configuration Providers
 * Provide configuration objects for different parts of the application
 */
export const configProviders: Provider[] = [
  {
    provide: API_CONFIG_TOKEN,
    useValue: {
      baseUrl: environment.apiUrl,
      timeout: environment.api.timeout,
      retryAttempts: environment.api.retryAttempts,
      retryDelay: environment.api.retryDelay,
    },
  },
  {
    provide: APP_CONFIG_TOKEN,
    useValue: {
      appName: environment.appName,
      version: environment.version,
      production: environment.production,
      features: environment.features,
    },
  },
];

/**
 * Error Handler Providers
 * Configure global error handling
 */
export const errorHandlerProviders: Provider[] = [
  {
    provide: ErrorHandler,
    useClass: GlobalErrorHandlerService,
  },
];

/**
 * All Core Providers
 * Combine all provider configurations
 */
export const coreProviders: Provider[] = [
  ...repositoryProviders,
  ...interceptorProviders,
  ...configProviders,
  ...errorHandlerProviders,
];
