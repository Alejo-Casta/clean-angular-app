import { Observable, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user.repository.interface';

/**
 * Update User Use Case - Encapsulates the business logic for updating user information
 * This use case contains all the business rules and validation for user updates
 */
export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Execute the use case to update user information
   */
  execute(
    id: string,
    userData: {
      firstName?: string;
      lastName?: string;
    },
  ): Observable<User> {
    // Validate input
    this.validateInput(id, userData);

    // Check if user exists
    return this.userRepository.getById(id).pipe(
      switchMap((existingUser) => {
        if (!existingUser) {
          return throwError(() => new Error('User not found'));
        }

        if (!existingUser.isActive) {
          return throwError(() => new Error('Cannot update inactive user'));
        }

        // Validate the update data
        this.validateUpdateData(userData);

        // Perform the update
        return this.userRepository.update(id, userData);
      }),
    );
  }

  /**
   * Validate input parameters
   */
  private validateInput(id: string, userData: any): void {
    if (!id || id.trim().length === 0) {
      throw new Error('User ID is required');
    }

    if (!userData || Object.keys(userData).length === 0) {
      throw new Error('Update data is required');
    }
  }

  /**
   * Validate update data according to business rules
   */
  private validateUpdateData(userData: {
    firstName?: string;
    lastName?: string;
  }): void {
    if (userData.firstName !== undefined) {
      if (!userData.firstName || userData.firstName.trim().length === 0) {
        throw new Error('First name cannot be empty');
      }

      if (userData.firstName.trim().length < 2) {
        throw new Error('First name must be at least 2 characters long');
      }

      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(userData.firstName)) {
        throw new Error('First name can only contain letters and spaces');
      }
    }

    if (userData.lastName !== undefined) {
      if (!userData.lastName || userData.lastName.trim().length === 0) {
        throw new Error('Last name cannot be empty');
      }

      if (userData.lastName.trim().length < 2) {
        throw new Error('Last name must be at least 2 characters long');
      }

      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(userData.lastName)) {
        throw new Error('Last name can only contain letters and spaces');
      }
    }
  }
}
