import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// Application layer imports
import { UserApplicationService } from '../../../core/application';
import { UserResponseDto, UserListQueryDto } from '../../../core/application';

// Shared services
import { NotificationService } from '../../../shared/services/notification.service';
import { LoadingService } from '../../../shared/services/loading.service';

/**
 * User List Component
 * Displays a paginated list of users with search and filtering capabilities
 */
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-list-container">
      <div class="header">
        <h2>User Management</h2>
        <button
          class="btn btn-primary"
          (click)="navigateToCreate()"
          [disabled]="loadingService.isLoading"
        >
          Add New User
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="filters">
        <div class="search-box">
          <input
            type="text"
            placeholder="Search users..."
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()"
            class="form-control"
          />
        </div>

        <div class="filter-controls">
          <select
            [(ngModel)]="activeFilter"
            (change)="onFilterChange()"
            class="form-control"
          >
            <option value="">All Users</option>
            <option value="true">Active Users</option>
            <option value="false">Inactive Users</option>
          </select>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div *ngIf="loadingService.isLoading" class="loading">
        Loading users...
      </div>

      <!-- User Table -->
      <div *ngIf="!loadingService.isLoading" class="user-table">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users" [class.inactive]="!user.isActive">
              <td>{{ user.fullName }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span
                  [class]="user.isActive ? 'status-active' : 'status-inactive'"
                >
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td class="actions">
                <button
                  class="btn btn-sm btn-secondary"
                  (click)="viewUser(user.id)"
                  title="View"
                >
                  View
                </button>
                <button
                  class="btn btn-sm btn-primary"
                  (click)="editUser(user.id)"
                  title="Edit"
                >
                  Edit
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  (click)="deleteUser(user)"
                  [disabled]="!user.isActive"
                  title="Delete"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div *ngIf="users.length === 0" class="empty-state">
          <p>No users found.</p>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="totalPages > 1" class="pagination">
        <button
          class="btn btn-outline-primary"
          [disabled]="currentPage === 1"
          (click)="goToPage(currentPage - 1)"
        >
          Previous
        </button>

        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }} ({{ totalUsers }} total)
        </span>

        <button
          class="btn btn-outline-primary"
          [disabled]="currentPage === totalPages"
          (click)="goToPage(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .user-list-container {
        padding: 20px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .filters {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
      }

      .search-box {
        flex: 1;
      }

      .filter-controls {
        min-width: 150px;
      }

      .form-control {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }

      .table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }

      .table th,
      .table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }

      .table th {
        background-color: #f8f9fa;
        font-weight: 600;
      }

      .table tr.inactive {
        opacity: 0.6;
      }

      .status-active {
        color: #28a745;
        font-weight: 500;
      }

      .status-inactive {
        color: #dc3545;
        font-weight: 500;
      }

      .actions {
        display: flex;
        gap: 8px;
      }

      .btn {
        padding: 6px 12px;
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

      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }

      .btn-danger {
        background-color: #dc3545;
        color: white;
      }

      .btn-outline-primary {
        background-color: transparent;
        color: #007bff;
        border: 1px solid #007bff;
      }

      .btn-sm {
        padding: 4px 8px;
        font-size: 12px;
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 15px;
      }

      .page-info {
        font-size: 14px;
        color: #666;
      }

      .loading {
        text-align: center;
        padding: 40px;
        color: #666;
      }

      .empty-state {
        text-align: center;
        padding: 40px;
        color: #666;
      }
    `,
  ],
})
export class UserListComponent implements OnInit, OnDestroy {
  users: UserResponseDto[] = [];
  currentPage = 1;
  pageSize = 10;
  totalUsers = 0;
  totalPages = 0;
  searchQuery = '';
  activeFilter = '';

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private userApplicationService: UserApplicationService,
    private notificationService: NotificationService,
    public loadingService: LoadingService,
    private router: Router,
  ) {
    // Setup search debouncing
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadUsers();
      });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load users with current filters and pagination
   */
  loadUsers(): void {
    const query: UserListQueryDto = {
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchQuery || undefined,
      isActive: this.activeFilter ? this.activeFilter === 'true' : undefined,
    };

    this.userApplicationService
      .getUsers(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.users = response.users;
          this.totalUsers = response.total;
          this.totalPages = response.totalPages;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.notificationService.showError('Error', 'Failed to load users');
        },
      });
  }

  /**
   * Handle search input changes
   */
  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  /**
   * Handle filter changes
   */
  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  /**
   * Navigate to specific page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  /**
   * Navigate to create user page
   */
  navigateToCreate(): void {
    this.router.navigate(['/users/create']);
  }

  /**
   * View user details
   */
  viewUser(userId: string): void {
    this.router.navigate(['/users', userId]);
  }

  /**
   * Edit user
   */
  editUser(userId: string): void {
    this.router.navigate(['/users', userId, 'edit']);
  }

  /**
   * Delete user (soft delete)
   */
  deleteUser(user: UserResponseDto): void {
    if (confirm(`Are you sure you want to delete ${user.fullName}?`)) {
      this.userApplicationService
        .deleteUser(user.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.showSuccess(
              'Success',
              'User deleted successfully',
            );
            this.loadUsers();
          },
          error: (error) => {
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
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
