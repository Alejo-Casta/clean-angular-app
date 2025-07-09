import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user.repository.interface';

/**
 * Get User Use Case - Encapsulates the business logic for retrieving a user
 * This use case belongs to the domain layer and contains the business rules
 */
export class GetUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Execute the use case to get a user by ID
   */
  execute(id: string): Observable<User | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('User ID is required');
    }

    return this.userRepository.getById(id);
  }

  /**
   * Execute the use case to get a user by email
   */
  executeByEmail(email: string): Observable<User | null> {
    if (!email || email.trim().length === 0) {
      throw new Error('Email is required');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    return this.userRepository.getByEmail(email);
  }
}
