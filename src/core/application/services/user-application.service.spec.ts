import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { USER_REPOSITORY_TOKEN } from '../../di/injection-tokens';
import { IUserRepository } from '../../domain';
import { User } from '../../domain/entities/user.entity';
import { UserApplicationService } from './user-application.service';

describe('UserApplicationService', () => {
  let service: UserApplicationService;
  let mockRepository: jasmine.SpyObj<IUserRepository>;

  beforeEach(() => {
    mockRepository = jasmine.createSpyObj('IUserRepository', [
      'getById',
      'getByEmail',
      'create',
      'update',
      'delete',
      'getAll',
      'search',
      'getActiveUsersCount',
      'existsByEmail',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        UserApplicationService,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
      ],
    });

    service = TestBed.inject(UserApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserById', () => {
    it('should return user DTO when user exists', (done) => {
      const user = new User(
        '1',
        'test@example.com',
        'John',
        'Doe',
        new Date('2023-01-01'),
        new Date('2023-01-01'),
        true,
      );

      mockRepository.getById.and.returnValue(of(user));

      service.getUserById('1').subscribe({
        next: (userDto) => {
          expect(userDto).toBeTruthy();
          expect(userDto!.id).toBe('1');
          expect(userDto!.email).toBe('test@example.com');
          expect(userDto!.firstName).toBe('John');
          expect(userDto!.lastName).toBe('Doe');
          expect(userDto!.fullName).toBe('John Doe');
          expect(userDto!.isActive).toBe(true);
          done();
        },
        error: done.fail,
      });
    });

    it('should return null when user does not exist', (done) => {
      mockRepository.getById.and.returnValue(of(null));

      service.getUserById('1').subscribe({
        next: (userDto) => {
          expect(userDto).toBeNull();
          done();
        },
        error: done.fail,
      });
    });
  });

  describe('createUser', () => {
    it('should create user and return DTO', (done) => {
      const createUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const createdUser = new User(
        '1',
        createUserDto.email,
        createUserDto.firstName,
        createUserDto.lastName,
        new Date(),
        new Date(),
        true,
      );

      mockRepository.existsByEmail.and.returnValue(of(false));
      mockRepository.create.and.returnValue(of(createdUser));

      service.createUser(createUserDto).subscribe({
        next: (userDto) => {
          expect(userDto).toBeTruthy();
          expect(userDto.id).toBe('1');
          expect(userDto.email).toBe(createUserDto.email);
          expect(userDto.firstName).toBe(createUserDto.firstName);
          expect(userDto.lastName).toBe(createUserDto.lastName);
          done();
        },
        error: done.fail,
      });
    });
  });

  describe('getUsers', () => {
    it('should return paginated user list', (done) => {
      const users = [
        new User(
          '1',
          'user1@example.com',
          'John',
          'Doe',
          new Date(),
          new Date(),
          true,
        ),
        new User(
          '2',
          'user2@example.com',
          'Jane',
          'Smith',
          new Date(),
          new Date(),
          true,
        ),
      ];

      const repositoryResponse = {
        users,
        total: 2,
        page: 1,
        limit: 10,
      };

      mockRepository.getAll.and.returnValue(of(repositoryResponse));

      service.getUsers({ page: 1, limit: 10 }).subscribe({
        next: (response) => {
          expect(response.users).toHaveSize(2);
          expect(response.total).toBe(2);
          expect(response.page).toBe(1);
          expect(response.limit).toBe(10);
          expect(response.totalPages).toBe(1);

          expect(response.users[0].id).toBe('1');
          expect(response.users[0].fullName).toBe('John Doe');
          expect(response.users[1].id).toBe('2');
          expect(response.users[1].fullName).toBe('Jane Smith');
          done();
        },
        error: done.fail,
      });
    });
  });

  describe('updateUser', () => {
    it('should update user and return DTO', (done) => {
      const updateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const updatedUser = new User(
        '1',
        'test@example.com',
        updateUserDto.firstName!,
        updateUserDto.lastName!,
        new Date('2023-01-01'),
        new Date(),
        true,
      );

      mockRepository.getById.and.returnValue(of(updatedUser));
      mockRepository.update.and.returnValue(of(updatedUser));

      service.updateUser('1', updateUserDto).subscribe({
        next: (userDto) => {
          expect(userDto).toBeTruthy();
          expect(userDto.firstName).toBe('Jane');
          expect(userDto.lastName).toBe('Smith');
          expect(userDto.fullName).toBe('Jane Smith');
          done();
        },
        error: done.fail,
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', (done) => {
      mockRepository.getById.and.returnValue(
        of(
          new User(
            '1',
            'test@example.com',
            'John',
            'Doe',
            new Date(),
            new Date(),
            true,
          ),
        ),
      );
      mockRepository.delete.and.returnValue(of(true));

      service.deleteUser('1').subscribe({
        next: (result) => {
          expect(result).toBe(true);
          done();
        },
        error: done.fail,
      });
    });
  });

  describe('searchUsers', () => {
    it('should search users and return DTOs', (done) => {
      const users = [
        new User(
          '1',
          'john@example.com',
          'John',
          'Doe',
          new Date(),
          new Date(),
          true,
        ),
      ];

      mockRepository.search.and.returnValue(of(users));

      service.searchUsers({ query: 'john', limit: 10 }).subscribe({
        next: (userDtos) => {
          expect(userDtos).toHaveSize(1);
          expect(userDtos[0].firstName).toBe('John');
          done();
        },
        error: done.fail,
      });
    });
  });
});
