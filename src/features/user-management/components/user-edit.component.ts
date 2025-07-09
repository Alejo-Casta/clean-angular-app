import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, switchMap } from 'rxjs';

// Application layer imports
import { UserApplicationService } from '../../../core/application';
import { UpdateUserDto, UserResponseDto } from '../../../core/application';

// Shared services
import { NotificationService } from '../../../shared/services/notification.service';
import { LoadingService } from '../../../shared/services/loading.service';

// Feature components
import { UserFormComponent } from './user-form.component';

/**
 * User Edit Component
 * Handles editing of existing users
 */
@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, UserFormComponent],
  template: `
    <div class="user-edit-container">
      <div class="header">
        <h2>Edit User</h2>
        <div class="header-actions">
          <button
            class="btn btn-secondary"
            (click)="navigateToView()"
            [disabled]="isSubmitting"
          >
            View User
          </button>
          <button
            class="btn btn-secondary"
            (click)="navigateBack()"
            [disabled]="isSubmitting"
          >
            Back to Users
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loadingService.isLoading && !user" class="loading">
        Loading user data...
      </div>

      <!-- Error State -->
      <div
        *ngIf="!loadingService.isLoading && !user && hasError"
        class="error-state"
      >
        <h3>User Not Found</h3>
        <p>The user you're trying to edit could not be found.</p>
        <button class="btn btn-primary" (click)="navigateBack()">
          Back to Users
        </button>
      </div>

      <!-- Form -->
      <div *ngIf="user" class="form-container">
        <app-user-form
          [user]="user"
          [isSubmitting]="isSubmitting"
          (updateUser)="onUpdateUser($event)"
          (formCancel)="navigateBack()"
        >
        </app-user-form>
      </div>
    </div>
  `,
  styles: [
    `
      .user-edit-container {
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

      .header-actions {
        display: flex;
        gap: 10px;
      }

      .form-container {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .loading {
        text-align: center;
        padding: 60px 20px;
        color: #666;
        font-size: 16px;
      }

      .error-state {
        text-align: center;
        padding: 60px 20px;
      }

      .error-state h3 {
        color: #dc3545;
        margin-bottom: 10px;
      }

      .error-state p {
        color: #666;
        margin-bottom: 20px;
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

      .btn-primary {
        background-color: #007bff;
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background-color: #0056b3;
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
export class UserEditComponent implements OnInit, OnDestroy {
  user: UserResponseDto | null = null;
  isSubmitting = false;
  hasError = false;
  private userId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private userApplicationService: UserApplicationService,
    private notificationService: NotificationService,
    public loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          this.userId = params.get('id');
          if (!this.userId) {
            this.hasError = true;
            return [];
          }
          return this.userApplicationService.getUserById(this.userId);
        }),
      )
      .subscribe({
        next: (user) => {
          if (user) {
            this.user = user;
            this.hasError = false;
          } else {
            this.hasError = true;
            this.notificationService.showError('Error', 'User not found');
          }
        },
        error: (error) => {
          this.hasError = true;
          console.error('Error loading user:', error);
          this.notificationService.showError(
            'Error',
            'Failed to load user data',
          );
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle user update
   */
  onUpdateUser(userData: UpdateUserDto): void {
    if (!this.userId) {
      this.notificationService.showError('Error', 'User ID not found');
      return;
    }

    // Check if there are any changes
    if (Object.keys(userData).length === 0) {
      this.notificationService.showInfo('Info', 'No changes to save');
      return;
    }

    this.isSubmitting = true;

    this.userApplicationService
      .updateUser(this.userId, userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser) => {
          this.isSubmitting = false;
          this.user = updatedUser;
          this.notificationService.showSuccess(
            'Success',
            `User ${updatedUser.fullName} updated successfully`,
          );
          // Optionally navigate back to user list or stay on edit page
          this.router.navigate(['/users']);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating user:', error);

          // Extract error message
          let errorMessage = 'Failed to update user';
          if (error.message) {
            errorMessage = error.message;
          }

          this.notificationService.showError('Error', errorMessage);
        },
      });
  }

  /**
   * Navigate to user view page
   */
  navigateToView(): void {
    if (this.userId) {
      this.router.navigate(['/users', this.userId]);
    }
  }

  /**
   * Navigate back to user list
   */
  navigateBack(): void {
    this.router.navigate(['/users']);
  }
}
