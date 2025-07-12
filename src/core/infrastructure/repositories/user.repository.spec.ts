import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserHttpService } from '../http/user-http.service';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockHttpService: jasmine.SpyObj<UserHttpService>;

  beforeEach(() => {
    mockHttpService = jasmine.createSpyObj('UserHttpService', [
      'getUsers',
      'getUserById',
      'getUserByEmail',
      'createUser',
      'updateUser',
      'deleteUser',
      'permanentDeleteUser',
      'checkUserExists',
      'searchUsers',
      'getUsersByDateRange',
      'getActiveUsersCount',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        UserRepository,
        {
          provide: UserHttpService,
          useValue: mockHttpService,
        },
      ],
    });

    repository = TestBed.inject(UserRepository);
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return users with pagination', (done) => {
      const mockResponse = {
        users: [
          {
            id: '1',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
            isActive: true,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockHttpService.getUsers.and.returnValue(of(mockResponse));

      repository.getAll({ page: 1, limit: 10 }).subscribe({
        next: (result) => {
          expect(result.users).toHaveSize(1);
          expect(result.users[0].id).toBe('1');
          expect(result.users[0].email).toBe('test@example.com');
          expect(result.total).toBe(1);
          expect(result.page).toBe(1);
          expect(result.limit).toBe(10);
          done();
        },
        error: done.fail,
      });
    });

    it('should handle HTTP errors', (done) => {
      const httpError = { status: 500, message: 'Server error' };
      mockHttpService.getUsers.and.returnValue(throwError(() => httpError));

      repository.getAll().subscribe({
        next: () => done.fail('Should have thrown error'),
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        },
      });
    });
  });

  describe('getById', () => {
    it('should return user when found', (done) => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        isActive: true,
      };

      mockHttpService.getUserById.and.returnValue(of(mockUser));

      repository.getById('1').subscribe({
        next: (user) => {
          expect(user).toBeTruthy();
          expect(user!.id).toBe('1');
          expect(user!.email).toBe('test@example.com');
          done();
        },
        error: done.fail,
      });
    });

    it('should return null when user not found (404)', (done) => {
      const httpError = { status: 404 };
      mockHttpService.getUserById.and.returnValue(throwError(() => httpError));

      repository.getById('1').subscribe({
        next: (user) => {
          expect(user).toBeNull();
          done();
        },
        error: done.fail,
      });
    });
  });

  describe('create', () => {
    it('should create user successfully', (done) => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockCreatedUser = {
        id: '1',
        ...userData,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        isActive: true,
      };

      mockHttpService.createUser.and.returnValue(of(mockCreatedUser));

      repository.create(userData).subscribe({
        next: (user) => {
          expect(user).toBeTruthy();
          expect(user.id).toBe('1');
          expect(user.email).toBe(userData.email);
          expect(user.firstName).toBe(userData.firstName);
          expect(user.lastName).toBe(userData.lastName);
          done();
        },
        error: done.fail,
      });
    });

    it('should handle conflict error (409)', (done) => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const httpError = { status: 409 };
      mockHttpService.createUser.and.returnValue(throwError(() => httpError));

      repository.create(userData).subscribe({
        next: () => done.fail('Should have thrown error'),
        error: (error) => {
          expect(error.message).toBe('User with this email already exists');
          done();
        },
      });
    });
  });

  describe('update', () => {
    it('should update user successfully', (done) => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const mockUpdatedUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        isActive: true,
      };

      mockHttpService.updateUser.and.returnValue(of(mockUpdatedUser));

      repository.update('1', updateData).subscribe({
        next: (user) => {
          expect(user).toBeTruthy();
          expect(user.firstName).toBe('Jane');
          expect(user.lastName).toBe('Smith');
          done();
        },
        error: done.fail,
      });
    });
  });

  describe('delete', () => {
    it('should delete user successfully', (done) => {
      mockHttpService.deleteUser.and.returnValue(of({ success: true }));

      repository.delete('1').subscribe({
        next: (result) => {
          expect(result).toBe(true);
          done();
        },
        error: done.fail,
      });
    });
  });

  describe('existsByEmail', () => {
    it('should return true when user exists', (done) => {
      mockHttpService.checkUserExists.and.returnValue(of({ exists: true }));

      repository.existsByEmail('test@example.com').subscribe({
        next: (exists) => {
          expect(exists).toBe(true);
          done();
        },
        error: done.fail,
      });
    });

    it('should return false when user does not exist', (done) => {
      mockHttpService.checkUserExists.and.returnValue(of({ exists: false }));

      repository.existsByEmail('test@example.com').subscribe({
        next: (exists) => {
          expect(exists).toBe(false);
          done();
        },
        error: done.fail,
      });
    });
  });
});
