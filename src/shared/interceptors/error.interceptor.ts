import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { NotificationService } from '../services/notification.service';
import { LoadingService } from '../services/loading.service';

/**
 * Error Interceptor
 * Handles HTTP errors globally and provides user-friendly error messages
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notificationService: NotificationService,
    private loadingService: LoadingService,
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Stop any loading states
        this.loadingService.stopAllLoading();

        // Handle different types of errors
        this.handleError(error);

        // Re-throw the error for component-level handling
        return throwError(() => error);
      }),
    );
  }

  /**
   * Handle different types of HTTP errors
   */
  private handleError(error: HttpErrorResponse): void {
    let errorMessage = 'An unexpected error occurred';
    let errorTitle = 'Error';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
      errorTitle = 'Network Error';
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorTitle = 'Bad Request';
          errorMessage =
            this.extractErrorMessage(error) || 'Invalid request data';
          break;
        case 401:
          errorTitle = 'Unauthorized';
          errorMessage = 'Please log in to continue';
          // Optionally redirect to login page
          break;
        case 403:
          errorTitle = 'Forbidden';
          errorMessage = 'You do not have permission to perform this action';
          break;
        case 404:
          errorTitle = 'Not Found';
          errorMessage = 'The requested resource was not found';
          break;
        case 409:
          errorTitle = 'Conflict';
          errorMessage =
            this.extractErrorMessage(error) ||
            'A conflict occurred with the current state';
          break;
        case 422:
          errorTitle = 'Validation Error';
          errorMessage =
            this.extractErrorMessage(error) || 'Please check your input data';
          break;
        case 429:
          errorTitle = 'Too Many Requests';
          errorMessage = 'Please wait before making another request';
          break;
        case 500:
          errorTitle = 'Server Error';
          errorMessage = 'An internal server error occurred';
          break;
        case 502:
          errorTitle = 'Bad Gateway';
          errorMessage = 'The server is temporarily unavailable';
          break;
        case 503:
          errorTitle = 'Service Unavailable';
          errorMessage = 'The service is temporarily unavailable';
          break;
        case 504:
          errorTitle = 'Gateway Timeout';
          errorMessage = 'The request timed out';
          break;
        default:
          errorTitle = `Error ${error.status}`;
          errorMessage =
            this.extractErrorMessage(error) || `HTTP Error ${error.status}`;
      }
    }

    // Show error notification
    this.notificationService.showError(errorTitle, errorMessage);

    // Log error for debugging (in development)
    if (!environment.production) {
      console.error('HTTP Error:', error);
    }
  }

  /**
   * Extract error message from HTTP error response
   */
  private extractErrorMessage(error: HttpErrorResponse): string | null {
    if (error.error) {
      // Try to extract message from different possible structures
      if (typeof error.error === 'string') {
        return error.error;
      }

      if (error.error.message) {
        return error.error.message;
      }

      if (error.error.error) {
        return error.error.error;
      }

      if (error.error.errors && Array.isArray(error.error.errors)) {
        return error.error.errors.join(', ');
      }
    }

    return error.message || null;
  }
}

// Import environment for production check
import { environment } from '../../environments/environment';
