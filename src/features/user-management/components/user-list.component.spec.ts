import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserListComponent } from './user-list.component';
import { UserApplicationService } from '../../../core/application';
import { NotificationService } from '../../../shared/services/notification.service';
import { LoadingService } from '../../../shared/services/loading.service';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockUserService: jasmine.SpyObj<UserApplicationService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUsers = [
    {
      id: '1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      isActive: true,
    },
    {
      id: '2',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      fullName: 'Jane Smith',
      createdAt: '2023-01-02T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
      isActive: false,
    },
  ];

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserApplicationService', [
      'getUsers',
      'deleteUser',
    ]);

    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
    ]);

    mockLoadingService = jasmine.createSpyObj('LoadingService', [], {
      isLoading: false,
    });

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        { provide: UserApplicationService, useValue: mockUserService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load users on initialization', () => {
      const mockResponse = {
        users: mockUsers,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockUserService.getUsers.and.returnValue(of(mockResponse));

      component.ngOnInit();

      expect(mockUserService.getUsers).toHaveBeenCalled();
      expect(component.users).toEqual(mockUsers);
      expect(component.totalUsers).toBe(2);
      expect(component.totalPages).toBe(1);
    });

    it('should handle error when loading users fails', () => {
      const error = new Error('Failed to load users');
      mockUserService.getUsers.and.returnValue(throwError(() => error));

      component.ngOnInit();

      expect(mockNotificationService.showError).toHaveBeenCalledWith(
        'Error',
        'Failed to load users',
      );
    });
  });

  describe('loadUsers', () => {
    it('should load users with current filters', () => {
      const mockResponse = {
        users: mockUsers,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockUserService.getUsers.and.returnValue(of(mockResponse));

      component.searchQuery = 'john';
      component.activeFilter = 'true';
      component.loadUsers();

      expect(mockUserService.getUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'john',
        isActive: true,
      });
    });
  });

  describe('onSearchChange', () => {
    it('should trigger search after debounce', (done) => {
      const mockResponse = {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockUserService.getUsers.and.returnValue(of(mockResponse));

      component.searchQuery = 'test';
      component.onSearchChange();

      // Wait for debounce
      setTimeout(() => {
        expect(mockUserService.getUsers).toHaveBeenCalled();
        done();
      }, 350);
    });
  });

  describe('onFilterChange', () => {
    it('should reset page and reload users', () => {
      const mockResponse = {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockUserService.getUsers.and.returnValue(of(mockResponse));

      component.currentPage = 2;
      component.activeFilter = 'true';
      component.onFilterChange();

      expect(component.currentPage).toBe(1);
      expect(mockUserService.getUsers).toHaveBeenCalled();
    });
  });

  describe('goToPage', () => {
    it('should navigate to valid page', () => {
      const mockResponse = {
        users: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 3,
      };

      mockUserService.getUsers.and.returnValue(of(mockResponse));

      component.totalPages = 3;
      component.goToPage(2);

      expect(component.currentPage).toBe(2);
      expect(mockUserService.getUsers).toHaveBeenCalled();
    });

    it('should not navigate to invalid page', () => {
      component.totalPages = 3;
      component.currentPage = 1;

      component.goToPage(0); // Invalid page
      expect(component.currentPage).toBe(1);

      component.goToPage(4); // Invalid page
      expect(component.currentPage).toBe(1);
    });
  });

  describe('navigation methods', () => {
    it('should navigate to create user page', () => {
      component.navigateToCreate();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/users/create']);
    });

    it('should navigate to view user page', () => {
      component.viewUser('1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/users', '1']);
    });

    it('should navigate to edit user page', () => {
      component.editUser('1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/users', '1', 'edit']);
    });
  });

  describe('deleteUser', () => {
    it('should delete user after confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockUserService.deleteUser.and.returnValue(of(true));

      const mockResponse = {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      mockUserService.getUsers.and.returnValue(of(mockResponse));

      const user = mockUsers[0];
      component.deleteUser(user);

      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete John Doe?',
      );
      expect(mockUserService.deleteUser).toHaveBeenCalledWith('1');
      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith(
        'Success',
        'User deleted successfully',
      );
    });

    it('should not delete user if not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      const user = mockUsers[0];
      component.deleteUser(user);

      expect(mockUserService.deleteUser).not.toHaveBeenCalled();
    });

    it('should handle delete error', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const error = new Error('Delete failed');
      mockUserService.deleteUser.and.returnValue(throwError(() => error));

      const user = mockUsers[0];
      component.deleteUser(user);

      expect(mockNotificationService.showError).toHaveBeenCalledWith(
        'Error',
        'Failed to delete user',
      );
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const dateString = '2023-01-01T00:00:00.000Z';
      const formatted = component.formatDate(dateString);

      expect(formatted).toBe(new Date(dateString).toLocaleDateString());
    });
  });
});
