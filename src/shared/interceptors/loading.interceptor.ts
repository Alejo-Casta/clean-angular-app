import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LoadingService } from '../services/loading.service';

/**
 * Loading Interceptor
 * Automatically manages loading states for HTTP requests
 */
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private loadingService: LoadingService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // Generate a unique key for this request
    const requestKey = this.generateRequestKey(request);

    // Start loading
    this.activeRequests++;
    this.loadingService.startLoading(requestKey);

    return next.handle(request).pipe(
      finalize(() => {
        // Stop loading when request completes (success or error)
        this.activeRequests--;
        this.loadingService.stopLoading(requestKey);
      }),
    );
  }

  /**
   * Generate a unique key for the request
   */
  private generateRequestKey(request: HttpRequest<any>): string {
    return `${request.method}-${request.url}-${Date.now()}`;
  }
}
