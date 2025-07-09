import { InjectionToken } from '@angular/core';
import { IUserRepository } from '../domain';

/**
 * Injection Tokens for Clean Architecture
 * These tokens are used to inject interfaces instead of concrete implementations
 * This follows the Dependency Inversion Principle
 */

/**
 * Token for User Repository interface
 * This allows us to inject different implementations (real API, mock, etc.)
 */
export const USER_REPOSITORY_TOKEN = new InjectionToken<IUserRepository>(
  'UserRepository',
);

/**
 * Configuration tokens
 */
export const API_CONFIG_TOKEN = new InjectionToken<any>('ApiConfig');
export const APP_CONFIG_TOKEN = new InjectionToken<any>('AppConfig');
