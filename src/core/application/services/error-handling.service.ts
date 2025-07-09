import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  DomainError,
  DomainErrorFactory,
} from '../../domain/errors/domain-errors';
import { NotificationService } from '../../../shared/services/notification.service';

/**
 * Application Error Handling Service
 * Handles errors at the application layer and converts them to domain errors
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  constructor(private notificationService: NotificationService) {}

  /**
   * Handle errors from repository operations
   */
  handleRepositoryError<T>(operation: string) {
    return (error: any): Observable<T> => {
      console.error(`Repository operation '${operation}' failed:`, error);

      // Convert to domain error
      const domainError = DomainErrorFactory.fromHttpError(error);

      // Show user notification
      this.notificationService.showError('Error', domainError.userMessage);

      // Re-throw as domain error
      return throwError(() => domainError);
    };
  }

  /**
   * Handle validation errors
   */
  handleValidationError(errors: string[]): Observable<never> {
    const domainError = DomainErrorFactory.fromValidationErrors(errors);

    // Show validation errors to user
    this.notificationService.showError('Validation Error', errors.join(', '));

    return throwError(() => domainError);
  }

  /**
   * Handle business rule violations
   */
  handleBusinessRuleViolation(
    message: string,
    rule: string,
  ): Observable<never> {
    const domainError = DomainErrorFactory.businessRuleViolation(message, rule);

    // Show business rule violation to user
    this.notificationService.showError(
      'Business Rule Violation',
      domainError.userMessage,
    );

    return throwError(() => domainError);
  }

  /**
   * Generic error handler for use cases
   */
  handleUseCaseError<T>(useCaseName: string) {
    return (error: any): Observable<T> => {
      console.error(`Use case '${useCaseName}' failed:`, error);

      // If it's already a domain error, just re-throw
      if (error instanceof DomainError) {
        return throwError(() => error);
      }

      // Convert unknown errors to domain errors
      const domainError = DomainErrorFactory.fromHttpError(error);

      // Show user notification
      this.notificationService.showError(
        'Operation Failed',
        domainError.userMessage,
      );

      return throwError(() => domainError);
    };
  }

  /**
   * Handle errors with custom user message
   */
  handleErrorWithMessage<T>(userMessage: string, logMessage?: string) {
    return (error: any): Observable<T> => {
      console.error(logMessage || 'Operation failed:', error);

      // Show custom message to user
      this.notificationService.showError('Error', userMessage);

      // Convert to domain error if needed
      const domainError =
        error instanceof DomainError
          ? error
          : DomainErrorFactory.fromHttpError(error);

      return throwError(() => domainError);
    };
  }

  /**
   * Handle errors silently (log only, no user notification)
   */
  handleSilentError<T>(operation: string) {
    return (error: any): Observable<T> => {
      console.error(`Silent error in operation '${operation}':`, error);

      // Convert to domain error
      const domainError =
        error instanceof DomainError
          ? error
          : DomainErrorFactory.fromHttpError(error);

      return throwError(() => domainError);
    };
  }

  /**
   * Log error without throwing
   */
  logError(error: any, context?: string): void {
    const contextMessage = context ? `[${context}] ` : '';
    console.error(`${contextMessage}Error logged:`, error);

    // In production, send to logging service
    // this.sendToLoggingService(error, context);
  }

  /**
   * Check if error is a specific domain error type
   */
  isDomainError(
    error: any,
    errorType?: new (...args: any[]) => DomainError,
  ): boolean {
    if (errorType) {
      return error instanceof errorType;
    }
    return error instanceof DomainError;
  }

  /**
   * Extract user-friendly message from any error
   */
  extractUserMessage(error: any): string {
    if (error instanceof DomainError) {
      return error.userMessage;
    }

    if (error?.message) {
      return error.message;
    }

    return 'An unexpected error occurred';
  }
}
