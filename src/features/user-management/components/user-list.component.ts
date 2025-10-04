import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

// PrimeNG imports

// Shared UI components

// Application layer imports
import {
  UserApplicationService,
  UserListQueryDto,
  UserResponseDto,
} from '../../../core/application';

// Shared services
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import {
  ConfirmDialogService,
  DropdownComponent,
} from '../../../shared/components/ui';
import { LoadingService } from '../../../shared/services/loading.service';
import { NotificationService } from '../../../shared/services/notification.service';

/**
 * User List Component
 * Displays a paginated list of users with search and filtering capabilities
 */
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,

    ButtonModule,
    TagModule,
    TooltipModule,
    PaginatorModule,
    DropdownComponent,
  ],
  template: `
    <div class="user-list-container">
      <div class="header">
        <h2>User Management</h2>
        <p-button
          label="Add New User"
          icon="pi pi-plus"
          (onClick)="navigateToCreate()"
          [disabled]="loadingService.isLoading"
        ></p-button>
      </div>

      <!-- Search and Filters -->
      <div class="filters">
        <div class="search-box">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              placeholder="Search users..."
              [(ngModel)]="searchQuery"
              (input)="onSearchChange()"
              class="w-full"
            />
          </span>
        </div>

        <div class="filter-controls">
          <app-dropdown
            [(ngModel)]="activeFilter"
            [options]="filterOptions"
            (selectionChange)="onFilterChange()"
            placeholder="Filter by status"
            class="w-full"
          ></app-dropdown>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div *ngIf="loadingService.isLoading" class="loading">
        Loading users...
      </div>

      <!-- User Table -->
      <p-table
        [value]="users"
        [loading]="loadingService.isLoading"
        [rows]="pageSize"
        [totalRecords]="totalUsers"
        [lazy]="true"
        [paginator]="true"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        [tableStyle]="{ 'min-width': '50rem' }"
        (onLazyLoad)="onLazyLoad($event)"
        styleClass="p-datatable-gridlines"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="fullName">
              Name <p-sortIcon field="fullName"></p-sortIcon>
            </th>
            <th pSortableColumn="email">
              Email <p-sortIcon field="email"></p-sortIcon>
            </th>
            <th pSortableColumn="isActive">
              Status <p-sortIcon field="isActive"></p-sortIcon>
            </th>
            <th pSortableColumn="createdAt">
              Created <p-sortIcon field="createdAt"></p-sortIcon>
            </th>
            <th>Actions</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-user>
          <tr [class.inactive-row]="!user.isActive">
            <td>{{ user.fullName }}</td>
            <td>{{ user.email }}</td>
            <td>
              <p-tag
                [value]="user.isActive ? 'Active' : 'Inactive'"
                [severity]="user.isActive ? 'success' : 'danger'"
              ></p-tag>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="flex gap-2">
                <p-button
                  icon="pi pi-eye"
                  size="small"
                  severity="secondary"
                  [text]="true"
                  (onClick)="viewUser(user.id)"
                  pTooltip="View user"
                ></p-button>
                <p-button
                  icon="pi pi-pencil"
                  size="small"
                  severity="info"
                  [text]="true"
                  (onClick)="editUser(user.id)"
                  pTooltip="Edit user"
                ></p-button>
                <p-button
                  icon="pi pi-trash"
                  size="small"
                  severity="danger"
                  [text]="true"
                  [disabled]="!user.isActive"
                  (onClick)="deleteUser(user)"
                  pTooltip="Delete user"
                ></p-button>
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="5" class="text-center">
              <div class="empty-state">
                <i
                  class="pi pi-users"
                  style="font-size: 3rem; color: var(--text-color-secondary)"
                ></i>
                <p>No users found.</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [
    `
      .user-list-container {
        padding: 1.5rem;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .header h2 {
        margin: 0;
        color: var(--text-color);
      }

      .filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        align-items: end;
      }

      .search-box {
        flex: 1;
        max-width: 300px;
      }

      .filter-controls {
        min-width: 200px;
      }

      .loading {
        text-align: center;
        padding: 3rem;
        color: var(--text-color-secondary);
        font-size: 1.1rem;
      }

      .empty-state {
        text-align: center;
        padding: 3rem;
        color: var(--text-color-secondary);
      }

      .empty-state i {
        display: block;
        margin-bottom: 1rem;
      }

      .empty-state p {
        margin: 0;
        font-size: 1.1rem;
      }

      /* PrimeNG table customizations */
      :host ::ng-deep .p-datatable {
        border-radius: 6px;
        overflow: hidden;
      }

      :host ::ng-deep .p-datatable .p-datatable-header {
        background: var(--surface-50);
        border: 1px solid var(--surface-200);
      }

      :host ::ng-deep .p-datatable .p-datatable-tbody > tr.inactive-row {
        opacity: 0.6;
      }

      :host ::ng-deep .p-datatable .p-datatable-tbody > tr.inactive-row td {
        color: var(--text-color-secondary);
      }

      /* Action buttons styling */
      :host ::ng-deep .p-button.p-button-text {
        padding: 0.375rem;
        margin: 0 0.125rem;
      }

      /* Search input styling */
      :host ::ng-deep .p-input-icon-left > .p-inputtext {
        padding-left: 2.5rem;
      }

      :host ::ng-deep .p-input-icon-left > i {
        left: 0.75rem;
        color: var(--text-color-secondary);
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .user-list-container {
          padding: 1rem;
        }

        .header {
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;
        }

        .filters {
          flex-direction: column;
          gap: 1rem;
        }

        .search-box,
        .filter-controls {
          max-width: none;
          min-width: auto;
        }

        :host ::ng-deep .p-datatable .p-datatable-tbody td {
          padding: 0.5rem;
        }

        :host ::ng-deep .p-button.p-button-text {
          padding: 0.25rem;
        }
      }

      /* Utility classes */
      .flex {
        display: flex;
      }

      .gap-2 {
        gap: 0.5rem;
      }

      .w-full {
        width: 100%;
      }

      .text-center {
        text-align: center;
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

  filterOptions = [
    { label: 'All Users', value: '' },
    { label: 'Active Users', value: 'true' },
    { label: 'Inactive Users', value: 'false' },
  ];

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private userApplicationService: UserApplicationService,
    private notificationService: NotificationService,
    public loadingService: LoadingService,
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
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
   * Handle PrimeNG table lazy loading events
   */
  onLazyLoad(event: any): void {
    // Update pagination
    this.currentPage = Math.floor(event.first / event.rows) + 1;
    this.pageSize = event.rows;

    // Handle sorting (if implemented in backend)
    // const sortField = event.sortField;
    // const sortOrder = event.sortOrder; // 1 for asc, -1 for desc

    // Reload data with new parameters
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
    this.confirmDialogService
      .confirmDelete(user.fullName)
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (confirmed) {
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
      });
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
