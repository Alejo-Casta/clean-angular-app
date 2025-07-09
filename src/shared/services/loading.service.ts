import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Loading Service
 * Manages loading states across the application
 */
@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingMap = new Map<string, boolean>();

  /**
   * Get loading state as observable
   */
  get isLoading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  /**
   * Get current loading state
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Set loading state for a specific key
   */
  setLoading(key: string, loading: boolean): void {
    if (loading) {
      this.loadingMap.set(key, loading);
    } else {
      this.loadingMap.delete(key);
    }

    // Update global loading state
    const isAnyLoading = this.loadingMap.size > 0;
    this.loadingSubject.next(isAnyLoading);
  }

  /**
   * Start loading for a specific key
   */
  startLoading(key: string): void {
    this.setLoading(key, true);
  }

  /**
   * Stop loading for a specific key
   */
  stopLoading(key: string): void {
    this.setLoading(key, false);
  }

  /**
   * Stop all loading states
   */
  stopAllLoading(): void {
    this.loadingMap.clear();
    this.loadingSubject.next(false);
  }

  /**
   * Check if a specific key is loading
   */
  isLoadingKey(key: string): boolean {
    return this.loadingMap.has(key);
  }

  /**
   * Get all active loading keys
   */
  getActiveLoadingKeys(): string[] {
    return Array.from(this.loadingMap.keys());
  }
}
