import { Observable, throwError } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user.repository.interface';

/**
 * Create User Use Case - Encapsulates the business logic for creating a new user
 * This use case contains all the business rules and validation for user creation
 */
export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Execute the use case to create a new user
   */
  execute(userData: {
    email: string;
    firstName: string;
    lastName: string;
  }): Observable<User> {
    // Validate input data
    this.validateUserData(userData);

    // Check if user already exists
    return this.userRepository.existsByEmail(userData.email).pipe(
      switchMap((exists) => {
        if (exists) {
          return throwError(
            () => new Error('User with this email already exists'),
          );
        }

        // Create the user
        return this.userRepository.create(userData);
      }),
      map((user) => {
        // Additional business logic after user creation can be added here
        // For example: send welcome email, create user profile, etc.
        return user;
      }),
    );
  }

  /**
   * Validate user data according to business rules
   */
  private validateUserData(userData: {
    email: string;
    firstName: string;
    lastName: string;
  }): void {
    if (!userData.email || userData.email.trim().length === 0) {
      throw new Error('Email is required');
    }

    if (!userData.firstName || userData.firstName.trim().length === 0) {
      throw new Error('First name is required');
    }

    if (!userData.lastName || userData.lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate name length
    if (userData.firstName.trim().length < 2) {
      throw new Error('First name must be at least 2 characters long');
    }

    if (userData.lastName.trim().length < 2) {
      throw new Error('Last name must be at least 2 characters long');
    }

    // Validate name format (only letters and spaces)
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(userData.firstName)) {
      throw new Error('First name can only contain letters and spaces');
    }

    if (!nameRegex.test(userData.lastName)) {
      throw new Error('Last name can only contain letters and spaces');
    }
  }
}
