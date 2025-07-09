import { Injectable, ErrorHandler } from '@angular/core';
import { NotificationService } from './notification.service';
import { environment } from '../../environments/environment';

/**
 * Global Error Handler Service
 * Handles uncaught errors throughout the application
 */
@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandlerService implements ErrorHandler {
  constructor(private notificationService: NotificationService) {}

  handleError(error: any): void {
    // Log error to console in development
    if (!environment.production) {
      console.error('Global error caught:', error);
    }

    // Extract meaningful error message
    const errorMessage = this.extractErrorMessage(error);

    // Show user-friendly notification
    this.notificationService.showError('Application Error', errorMessage);

    // In production, you might want to send errors to a logging service
    if (environment.production && environment.features.enableErrorReporting) {
      this.reportError(error);
    }
  }

  /**
   * Extract a user-friendly error message from the error object
   */
  private extractErrorMessage(error: any): string {
    if (!error) {
      return 'An unknown error occurred';
    }

    // Handle different types of errors
    if (error.message) {
      return error.message;
    }

    if (error.error && error.error.message) {
      return error.error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    // Handle Angular HTTP errors
    if (error.status) {
      switch (error.status) {
        case 0:
          return 'Network connection error. Please check your internet connection.';
        case 404:
          return 'The requested resource was not found.';
        case 500:
          return 'Internal server error. Please try again later.';
        default:
          return `Server error (${error.status}). Please try again later.`;
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Report error to external logging service
   * This is a placeholder - implement with your preferred logging service
   */
  private reportError(error: any): void {
    // Example: Send to logging service
    // this.loggingService.logError(error);

    // For now, just log to console
    console.error('Error reported to logging service:', error);
  }
}
