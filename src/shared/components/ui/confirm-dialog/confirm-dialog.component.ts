import { Component, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Observable } from 'rxjs';

export interface ConfirmDialogConfig {
  message: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptButtonStyleClass?: string;
  rejectButtonStyleClass?: string;
  blockScroll?: boolean;
  closeOnEscape?: boolean;
  dismissableMask?: boolean;
}

/**
 * Shared Confirm Dialog Service
 * Provides a service-based approach to confirmation dialogs
 */
@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  constructor(private confirmationService: ConfirmationService) {}

  confirm(config: ConfirmDialogConfig): Observable<boolean> {
    return new Observable(observer => {
      this.confirmationService.confirm({
        message: config.message,
        header: config.header || 'Confirmation',
        icon: config.icon || 'pi pi-exclamation-triangle',
        acceptLabel: config.acceptLabel || 'Yes',
        rejectLabel: config.rejectLabel || 'No',
        acceptButtonStyleClass: config.acceptButtonStyleClass || 'p-button-danger',
        rejectButtonStyleClass: config.rejectButtonStyleClass || 'p-button-text',
        blockScroll: config.blockScroll !== false,
        closeOnEscape: config.closeOnEscape !== false,
        dismissableMask: config.dismissableMask || false,
        accept: () => {
          observer.next(true);
          observer.complete();
        },
        reject: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  confirmDelete(itemName?: string): Observable<boolean> {
    const message = itemName 
      ? `Are you sure you want to delete ${itemName}? This action cannot be undone.`
      : 'Are you sure you want to delete this item? This action cannot be undone.';

    return this.confirm({
      message,
      header: 'Delete Confirmation',
      icon: 'pi pi-trash',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text'
    });
  }
}

/**
 * Shared Confirm Dialog Component
 * Wraps PrimeNG ConfirmDialog
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  template: `
    <p-confirmDialog
      [style]="{ width: '450px' }"
      [baseZIndex]="10000"
      rejectButtonStyleClass="p-button-text"
    ></p-confirmDialog>
  `,
})
export class ConfirmDialogComponent {
  constructor(private confirmationService: ConfirmationService) {}
}
