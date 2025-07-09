import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import {
  NotificationService,
  Notification,
} from '../services/notification.service';

/**
 * Notification Component
 * Displays application-wide notifications and alerts
 */
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div
        *ngFor="let notification of notifications"
        [class]="'notification notification-' + notification.type"
        (click)="removeNotification(notification.id)"
      >
        <div class="notification-content">
          <div class="notification-header">
            <strong>{{ notification.title }}</strong>
            <button
              class="close-btn"
              (click)="removeNotification(notification.id)"
            >
              ×
            </button>
          </div>
          <div *ngIf="notification.message" class="notification-message">
            {{ notification.message }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .notifications-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
      }

      .notification {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        margin-bottom: 10px;
        padding: 16px;
        border-left: 4px solid;
        cursor: pointer;
        transition: all 0.3s ease;
        animation: slideIn 0.3s ease-out;
      }

      .notification:hover {
        transform: translateX(-5px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }

      .notification-success {
        border-left-color: #28a745;
      }

      .notification-error {
        border-left-color: #dc3545;
      }

      .notification-warning {
        border-left-color: #ffc107;
      }

      .notification-info {
        border-left-color: #17a2b8;
      }

      .notification-content {
        display: flex;
        flex-direction: column;
      }

      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }

      .notification-header strong {
        color: #333;
        font-size: 14px;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 18px;
        color: #999;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .close-btn:hover {
        color: #666;
      }

      .notification-message {
        color: #666;
        font-size: 13px;
        line-height: 1.4;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @media (max-width: 480px) {
        .notifications-container {
          left: 10px;
          right: 10px;
          max-width: none;
        }
      }
    `,
  ],
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService
      .getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications) => {
        this.notifications = notifications;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }
}
