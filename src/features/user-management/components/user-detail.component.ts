import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, switchMap } from 'rxjs';

// Application layer imports
import { UserApplicationService } from '../../../core/application';
import { UserResponseDto } from '../../../core/application';

// Shared services
import { NotificationService } from '../../../shared/services/notification.service';
import { LoadingService } from '../../../shared/services/loading.service';

/**
 * User Detail Component
 * Displays detailed information about a specific user
 */
@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-detail-container">
      <div class="header">
        <h2>User Details</h2>
        <div class="header-actions">
          <button
            class="btn btn-primary"
            (click)="navigateToEdit()"
            [disabled]="!user || !user.isActive"
          >
            Edit User
          </button>
          <button class="btn btn-secondary" (click)="navigateBack()">
            Back to Users
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loadingService.isLoading && !user" class="loading">
        Loading user details...
      </div>

      <!-- Error State -->
      <div
        *ngIf="!loadingService.isLoading && !user && hasError"
        class="error-state"
      >
        <h3>User Not Found</h3>
        <p>The user you're looking for could not be found.</p>
        <button class="btn btn-primary" (click)="navigateBack()">
          Back to Users
        </button>
      </div>

      <!-- User Details -->
      <div *ngIf="user" class="user-details">
        <div class="detail-card">
          <div class="card-header">
            <h3>{{ user.fullName }}</h3>
            <span
              [class]="
                'status-badge ' + (user.isActive ? 'active' : 'inactive')
              "
            >
              {{ user.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="card-body">
            <div class="detail-row">
              <label>Email:</label>
              <span>{{ user.email }}</span>
            </div>

            <div class="detail-row">
              <label>First Name:</label>
              <span>{{ user.firstName }}</span>
            </div>

            <div class="detail-row">
              <label>Last Name:</label>
              <span>{{ user.lastName }}</span>
            </div>

            <div class="detail-row">
              <label>Full Name:</label>
              <span>{{ user.fullName }}</span>
            </div>

            <div class="detail-row">
              <label>Status:</label>
              <span [class]="user.isActive ? 'text-success' : 'text-danger'">
                {{ user.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <div class="detail-row">
              <label>Created:</label>
              <span>{{ formatDateTime(user.createdAt) }}</span>
            </div>

            <div class="detail-row">
              <label>Last Updated:</label>
              <span>{{ formatDateTime(user.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-section">
          <h4>Actions</h4>
          <div class="action-buttons">
            <button
              class="btn btn-primary"
              (click)="navigateToEdit()"
              [disabled]="!user.isActive"
            >
              Edit User
            </button>

            <button
              class="btn btn-warning"
              (click)="toggleUserStatus()"
              [disabled]="isProcessing"
            >
              {{ user.isActive ? 'Deactivate' : 'Activate' }} User
            </button>

            <button
              class="btn btn-danger"
              (click)="deleteUser()"
              [disabled]="!user.isActive || isProcessing"
            >
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .user-detail-container {
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

      .detail-card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-bottom: 30px;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 30px;
        border-bottom: 1px solid #eee;
      }

      .card-header h3 {
        margin: 0;
        color: #333;
      }

      .status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
      }

      .status-badge.active {
        background-color: #d4edda;
        color: #155724;
      }

      .status-badge.inactive {
        background-color: #f8d7da;
        color: #721c24;
      }

      .card-body {
        padding: 30px;
      }

      .detail-row {
        display: flex;
        margin-bottom: 15px;
        align-items: center;
      }

      .detail-row label {
        font-weight: 500;
        color: #666;
        min-width: 120px;
        margin-right: 15px;
      }

      .detail-row span {
        color: #333;
      }

      .text-success {
        color: #28a745 !important;
      }

      .text-danger {
        color: #dc3545 !important;
      }

      .actions-section {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .actions-section h4 {
        margin: 0 0 20px 0;
        color: #333;
      }

      .action-buttons {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        display: inline-block;
        transition: background-color 0.3s ease;
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

      .btn-warning {
        background-color: #ffc107;
        color: #212529;
      }

      .btn-warning:hover:not(:disabled) {
        background-color: #e0a800;
      }

      .btn-danger {
        background-color: #dc3545;
        color: white;
      }

      .btn-danger:hover:not(:disabled) {
        background-color: #c82333;
      }
    `,
  ],
})
export class UserDetailComponent implements OnInit, OnDestroy {
  user: UserResponseDto | null = null;
  hasError = false;
  isProcessing = false;
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
   * Navigate to edit page
   */
  navigateToEdit(): void {
    if (this.userId) {
      this.router.navigate(['/users', this.userId, 'edit']);
    }
  }

  /**
   * Navigate back to user list
   */
  navigateBack(): void {
    this.router.navigate(['/users']);
  }

  /**
   * Toggle user active status
   */
  toggleUserStatus(): void {
    if (!this.user || !this.userId) return;

    const action = this.user.isActive ? 'deactivate' : 'activate';
    const confirmMessage = `Are you sure you want to ${action} ${this.user.fullName}?`;

    if (confirm(confirmMessage)) {
      this.isProcessing = true;

      // For now, we'll use the delete method for deactivation
      // In a real implementation, you might have separate activate/deactivate methods
      if (this.user.isActive) {
        this.userApplicationService
          .deleteUser(this.userId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.isProcessing = false;
              this.notificationService.showSuccess(
                'Success',
                'User deactivated successfully',
              );
              this.loadUser(); // Reload user data
            },
            error: (error) => {
              this.isProcessing = false;
              console.error('Error deactivating user:', error);
              this.notificationService.showError(
                'Error',
                'Failed to deactivate user',
              );
            },
          });
      }
    }
  }

  /**
   * Delete user
   */
  deleteUser(): void {
    if (!this.user || !this.userId) return;

    const confirmMessage = `Are you sure you want to delete ${this.user.fullName}? This action cannot be undone.`;

    if (confirm(confirmMessage)) {
      this.isProcessing = true;

      this.userApplicationService
        .deleteUser(this.userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isProcessing = false;
            this.notificationService.showSuccess(
              'Success',
              'User deleted successfully',
            );
            this.router.navigate(['/users']);
          },
          error: (error) => {
            this.isProcessing = false;
            console.error('Error deleting user:', error);
            this.notificationService.showError(
              'Error',
              'Failed to delete user',
            );
          },
        });
    }
  }

  /**
   * Format date and time for display
   */
  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  /**
   * Reload user data
   */
  private loadUser(): void {
    if (this.userId) {
      this.userApplicationService
        .getUserById(this.userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (user) => {
            this.user = user;
          },
          error: (error) => {
            console.error('Error reloading user:', error);
          },
        });
    }
  }
}
