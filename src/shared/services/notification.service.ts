import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Notification types
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
}

/**
 * Notification Service
 * Handles application-wide notifications and alerts
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private nextId = 1;

  /**
   * Get all notifications as observable
   */
  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  /**
   * Show success notification
   */
  showSuccess(title: string, message?: string, duration = 5000): void {
    this.addNotification('success', title, message, duration);
  }

  /**
   * Show error notification
   */
  showError(title: string, message?: string, duration = 8000): void {
    this.addNotification('error', title, message, duration);
  }

  /**
   * Show warning notification
   */
  showWarning(title: string, message?: string, duration = 6000): void {
    this.addNotification('warning', title, message, duration);
  }

  /**
   * Show info notification
   */
  showInfo(title: string, message?: string, duration = 5000): void {
    this.addNotification('info', title, message, duration);
  }

  /**
   * Remove notification by ID
   */
  removeNotification(id: string): void {
    const currentNotifications = this.notifications$.value;
    const updatedNotifications = currentNotifications.filter(
      (n) => n.id !== id,
    );
    this.notifications$.next(updatedNotifications);
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications$.next([]);
  }

  /**
   * Add notification to the list
   */
  private addNotification(
    type: NotificationType,
    title: string,
    message?: string,
    duration?: number,
  ): void {
    const notification: Notification = {
      id: this.nextId.toString(),
      type,
      title,
      message,
      duration,
      timestamp: new Date(),
    };

    this.nextId++;

    const currentNotifications = this.notifications$.value;
    this.notifications$.next([...currentNotifications, notification]);

    // Auto-remove notification after duration
    if (duration && duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, duration);
    }
  }
}
