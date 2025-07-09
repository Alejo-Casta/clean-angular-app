import { of, throwError } from 'rxjs';
import { CreateUserUseCase } from './create-user.use-case';
import { IUserRepository } from '../repositories/user.repository.interface';
import { User } from '../entities/user.entity';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: jasmine.SpyObj<IUserRepository>;

  beforeEach(() => {
    mockRepository = jasmine.createSpyObj('IUserRepository', [
      'existsByEmail',
      'create',
    ]);

    useCase = new CreateUserUseCase(mockRepository);
  });

  describe('execute', () => {
    const validUserData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should create user when email does not exist', (done) => {
      const expectedUser = new User(
        '1',
        validUserData.email,
        validUserData.firstName,
        validUserData.lastName,
        new Date(),
        new Date(),
        true,
      );

      mockRepository.existsByEmail.and.returnValue(of(false));
      mockRepository.create.and.returnValue(of(expectedUser));

      useCase.execute(validUserData).subscribe({
        next: (user) => {
          expect(user).toBe(expectedUser);
          expect(mockRepository.existsByEmail).toHaveBeenCalledWith(
            validUserData.email,
          );
          expect(mockRepository.create).toHaveBeenCalledWith(validUserData);
          done();
        },
        error: done.fail,
      });
    });

    it('should throw error when email already exists', (done) => {
      mockRepository.existsByEmail.and.returnValue(of(true));

      useCase.execute(validUserData).subscribe({
        next: () => done.fail('Should have thrown error'),
        error: (error) => {
          expect(error.message).toBe('User with this email already exists');
          expect(mockRepository.existsByEmail).toHaveBeenCalledWith(
            validUserData.email,
          );
          expect(mockRepository.create).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should throw error for invalid email', () => {
      expect(() => {
        useCase.execute({
          ...validUserData,
          email: 'invalid-email',
        });
      }).toThrow('Invalid email format');
    });

    it('should throw error for missing email', () => {
      expect(() => {
        useCase.execute({
          ...validUserData,
          email: '',
        });
      }).toThrow('Email is required');
    });

    it('should throw error for missing first name', () => {
      expect(() => {
        useCase.execute({
          ...validUserData,
          firstName: '',
        });
      }).toThrow('First name is required');
    });

    it('should throw error for missing last name', () => {
      expect(() => {
        useCase.execute({
          ...validUserData,
          lastName: '',
        });
      }).toThrow('Last name is required');
    });

    it('should throw error for short first name', () => {
      expect(() => {
        useCase.execute({
          ...validUserData,
          firstName: 'A',
        });
      }).toThrow('First name must be at least 2 characters long');
    });

    it('should throw error for invalid first name characters', () => {
      expect(() => {
        useCase.execute({
          ...validUserData,
          firstName: 'John123',
        });
      }).toThrow('First name can only contain letters and spaces');
    });

    it('should handle repository errors', (done) => {
      const repositoryError = new Error('Database connection failed');
      mockRepository.existsByEmail.and.returnValue(
        throwError(() => repositoryError),
      );

      useCase.execute(validUserData).subscribe({
        next: () => done.fail('Should have thrown error'),
        error: (error) => {
          expect(error).toBe(repositoryError);
          done();
        },
      });
    });
  });
});
