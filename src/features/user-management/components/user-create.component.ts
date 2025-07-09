import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Application layer imports
import { UserApplicationService } from '../../../core/application';
import { CreateUserDto } from '../../../core/application';

// Shared services
import { NotificationService } from '../../../shared/services/notification.service';
import { LoadingService } from '../../../shared/services/loading.service';

// Feature components
import { UserFormComponent } from './user-form.component';

/**
 * User Create Component
 * Handles the creation of new users
 */
@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, UserFormComponent],
  template: `
    <div class="user-create-container">
      <div class="header">
        <h2>Create New User</h2>
        <button
          class="btn btn-secondary"
          (click)="navigateBack()"
          [disabled]="isSubmitting"
        >
          Back to Users
        </button>
      </div>

      <div class="form-container">
        <app-user-form
          [isSubmitting]="isSubmitting"
          (createUser)="onCreateUser($event)"
          (formCancel)="navigateBack()"
        >
        </app-user-form>
      </div>
    </div>
  `,
  styles: [
    `
      .user-create-container {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
      }

      .header h2 {
        margin: 0;
        color: #333;
      }

      .form-container {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        text-decoration: none;
        display: inline-block;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }

      .btn-secondary:hover:not(:disabled) {
        background-color: #545b62;
      }
    `,
  ],
})
export class UserCreateComponent implements OnDestroy {
  isSubmitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private userApplicationService: UserApplicationService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private router: Router,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle user creation
   */
  onCreateUser(userData: CreateUserDto): void {
    this.isSubmitting = true;

    this.userApplicationService
      .createUser(userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.isSubmitting = false;
          this.notificationService.showSuccess(
            'Success',
            `User ${user.fullName} created successfully`,
          );
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating user:', error);

          // Extract error message
          let errorMessage = 'Failed to create user';
          if (error.message) {
            errorMessage = error.message;
          }

          this.notificationService.showError('Error', errorMessage);
        },
      });
  }

  /**
   * Navigate back to user list
   */
  navigateBack(): void {
    this.router.navigate(['/users']);
  }
}
