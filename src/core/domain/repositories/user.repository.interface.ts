import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';

/**
 * User Repository Interface - Defines the contract for user data operations
 * This interface belongs to the domain layer and defines what operations
 * are needed without specifying how they are implemented
 */
export interface IUserRepository {
  /**
   * Get all users with optional filtering and pagination
   */
  getAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Observable<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Get a user by their unique identifier
   */
  getById(id: string): Observable<User | null>;

  /**
   * Get a user by their email address
   */
  getByEmail(email: string): Observable<User | null>;

  /**
   * Create a new user
   */
  create(userData: {
    email: string;
    firstName: string;
    lastName: string;
  }): Observable<User>;

  /**
   * Update an existing user
   */
  update(
    id: string,
    userData: {
      firstName?: string;
      lastName?: string;
    },
  ): Observable<User>;

  /**
   * Delete a user (soft delete - deactivate)
   */
  delete(id: string): Observable<boolean>;

  /**
   * Permanently delete a user (hard delete)
   */
  permanentDelete(id: string): Observable<boolean>;

  /**
   * Check if a user exists by email
   */
  existsByEmail(email: string): Observable<boolean>;

  /**
   * Get users created within a date range
   */
  getByDateRange(startDate: Date, endDate: Date): Observable<User[]>;

  /**
   * Get active users count
   */
  getActiveUsersCount(): Observable<number>;

  /**
   * Search users by name or email
   */
  search(query: string, limit?: number): Observable<User[]>;
}
