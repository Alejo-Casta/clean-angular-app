import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Domain imports
import { User, IUserRepository } from '../../domain';
import { DomainErrorFactory } from '../../domain/errors/domain-errors';

// Infrastructure imports
import { UserHttpService } from '../http/user-http.service';

/**
 * User Repository Implementation
 * This class implements the IUserRepository interface from the domain layer
 * It handles the actual data persistence and retrieval using HTTP services
 */
@Injectable({
  providedIn: 'root',
})
export class UserRepository implements IUserRepository {
  constructor(private userHttpService: UserHttpService) {}

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
  }> {
    return this.userHttpService.getUsers(options).pipe(
      map((response) => ({
        users: response.users.map((userData) => this.mapToUser(userData)),
        total: response.total,
        page: response.page,
        limit: response.limit,
      })),
      catchError((error) => {
        console.error('Error fetching users:', error);
        return throwError(() => DomainErrorFactory.fromHttpError(error));
      }),
    );
  }

  /**
   * Get a user by their unique identifier
   */
  getById(id: string): Observable<User | null> {
    return this.userHttpService.getUserById(id).pipe(
      map((userData) => (userData ? this.mapToUser(userData) : null)),
      catchError((error) => {
        if (error.status === 404) {
          return of(null);
        }
        console.error('Error fetching user by ID:', error);
        return throwError(() => DomainErrorFactory.fromHttpError(error));
      }),
    );
  }

  /**
   * Get a user by their email address
   */
  getByEmail(email: string): Observable<User | null> {
    return this.userHttpService.getUserByEmail(email).pipe(
      map((userData) => (userData ? this.mapToUser(userData) : null)),
      catchError((error) => {
        if (error.status === 404) {
          return of(null);
        }
        console.error('Error fetching user by email:', error);
        return throwError(() => new Error('Failed to fetch user'));
      }),
    );
  }

  /**
   * Create a new user
   */
  create(userData: {
    email: string;
    firstName: string;
    lastName: string;
  }): Observable<User> {
    return this.userHttpService.createUser(userData).pipe(
      map((response) => this.mapToUser(response)),
      catchError((error) => {
        console.error('Error creating user:', error);
        if (error.status === 409) {
          return throwError(
            () => new Error('User with this email already exists'),
          );
        }
        return throwError(() => new Error('Failed to create user'));
      }),
    );
  }

  /**
   * Update an existing user
   */
  update(
    id: string,
    userData: {
      firstName?: string;
      lastName?: string;
    },
  ): Observable<User> {
    return this.userHttpService.updateUser(id, userData).pipe(
      map((response) => this.mapToUser(response)),
      catchError((error) => {
        console.error('Error updating user:', error);
        if (error.status === 404) {
          return throwError(() => new Error('User not found'));
        }
        return throwError(() => new Error('Failed to update user'));
      }),
    );
  }

  /**
   * Delete a user (soft delete - deactivate)
   */
  delete(id: string): Observable<boolean> {
    return this.userHttpService.deleteUser(id).pipe(
      map((response) => response.success),
      catchError((error) => {
        console.error('Error deleting user:', error);
        if (error.status === 404) {
          return throwError(() => new Error('User not found'));
        }
        return throwError(() => new Error('Failed to delete user'));
      }),
    );
  }

  /**
   * Permanently delete a user (hard delete)
   */
  permanentDelete(id: string): Observable<boolean> {
    return this.userHttpService.permanentDeleteUser(id).pipe(
      map((response) => response.success),
      catchError((error) => {
        console.error('Error permanently deleting user:', error);
        if (error.status === 404) {
          return throwError(() => new Error('User not found'));
        }
        return throwError(() => new Error('Failed to permanently delete user'));
      }),
    );
  }

  /**
   * Check if a user exists by email
   */
  existsByEmail(email: string): Observable<boolean> {
    return this.userHttpService.checkUserExists(email).pipe(
      map((response) => response.exists),
      catchError((error) => {
        console.error('Error checking user existence:', error);
        return throwError(() => new Error('Failed to check user existence'));
      }),
    );
  }

  /**
   * Get users created within a date range
   */
  getByDateRange(startDate: Date, endDate: Date): Observable<User[]> {
    return this.userHttpService.getUsersByDateRange(startDate, endDate).pipe(
      map((users) => users.map((userData) => this.mapToUser(userData))),
      catchError((error) => {
        console.error('Error fetching users by date range:', error);
        return throwError(
          () => new Error('Failed to fetch users by date range'),
        );
      }),
    );
  }

  /**
   * Get active users count
   */
  getActiveUsersCount(): Observable<number> {
    return this.userHttpService.getActiveUsersCount().pipe(
      map((response) => response.count),
      catchError((error) => {
        console.error('Error fetching active users count:', error);
        return throwError(
          () => new Error('Failed to fetch active users count'),
        );
      }),
    );
  }

  /**
   * Search users by name or email
   */
  search(query: string, limit?: number): Observable<User[]> {
    return this.userHttpService.searchUsers(query, limit).pipe(
      map((users) => users.map((userData) => this.mapToUser(userData))),
      catchError((error) => {
        console.error('Error searching users:', error);
        return throwError(() => new Error('Failed to search users'));
      }),
    );
  }

  /**
   * Map API response data to User entity
   */
  private mapToUser(userData: any): User {
    return new User(
      userData.id,
      userData.email,
      userData.firstName,
      userData.lastName,
      new Date(userData.createdAt),
      new Date(userData.updatedAt),
      userData.isActive,
    );
  }
}
