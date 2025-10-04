import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

import { NotificationService, Notification } from '../../../services/notification.service';

/**
 * Shared Toast Component
 * Integrates PrimeNG Toast with existing NotificationService
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast 
      [position]="position"
      [preventOpenDuplicates]="preventOpenDuplicates"
      [preventDuplicates]="preventDuplicates"
      [showTransformOptions]="showTransformOptions"
      [hideTransformOptions]="hideTransformOptions"
      [showTransitionOptions]="showTransitionOptions"
      [hideTransitionOptions]="hideTransitionOptions"
    ></p-toast>
  `,
})
export class ToastComponent implements OnInit, OnDestroy {
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center' = 'top-right';
  preventOpenDuplicates = false;
  preventDuplicates = false;
  showTransformOptions = 'translateX(100%)';
  hideTransformOptions = 'translateX(100%)';
  showTransitionOptions = '300ms ease-out';
  hideTransitionOptions = '250ms ease-in';

  private destroy$ = new Subject<void>();

  constructor(
    private messageService: MessageService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Subscribe to notifications from the existing service
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        // Clear existing messages
        this.messageService.clear();
        
        // Add new messages
        notifications.forEach(notification => {
          this.addToast(notification);
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private addToast(notification: Notification): void {
    const severity = this.mapNotificationTypeToSeverity(notification.type);
    
    this.messageService.add({
      key: 'main',
      severity,
      summary: notification.title,
      detail: notification.message,
      life: notification.duration || 5000,
      id: notification.id
    });
  }

  private mapNotificationTypeToSeverity(type: string): 'success' | 'info' | 'warn' | 'error' {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warn';
      case 'error':
        return 'error';
      case 'info':
      default:
        return 'info';
    }
  }
}
