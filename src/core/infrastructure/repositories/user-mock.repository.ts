import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

// Domain imports
import { User, IUserRepository } from '../../domain';

/**
 * Mock User Repository Implementation
 * This class provides a mock implementation for development and testing
 * It simulates API calls with in-memory data and realistic delays
 */
@Injectable({
  providedIn: 'root',
})
export class UserMockRepository implements IUserRepository {
  private users: User[] = [
    new User(
      '1',
      'john.doe@example.com',
      'John',
      'Doe',
      new Date('2023-01-15'),
      new Date('2023-01-15'),
      true,
    ),
    new User(
      '2',
      'jane.smith@example.com',
      'Jane',
      'Smith',
      new Date('2023-02-20'),
      new Date('2023-02-20'),
      true,
    ),
    new User(
      '3',
      'bob.johnson@example.com',
      'Bob',
      'Johnson',
      new Date('2023-03-10'),
      new Date('2023-03-10'),
      false,
    ),
    new User(
      '4',
      'alice.brown@example.com',
      'Alice',
      'Brown',
      new Date('2023-04-05'),
      new Date('2023-04-05'),
      true,
    ),
    new User(
      '5',
      'charlie.wilson@example.com',
      'Charlie',
      'Wilson',
      new Date('2023-05-12'),
      new Date('2023-05-12'),
      true,
    ),
  ];

  private nextId = 6;

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
    let filteredUsers = [...this.users];

    // Apply filters
    if (options?.isActive !== undefined) {
      filteredUsers = filteredUsers.filter(
        (user) => user.isActive === options.isActive,
      );
    }

    if (options?.search) {
      const searchTerm = options.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm) ||
          user.lastName.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm),
      );
    }

    // Apply pagination
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return of({
      users: paginatedUsers,
      total: filteredUsers.length,
      page,
      limit,
    }).pipe(delay(500)); // Simulate network delay
  }

  /**
   * Get a user by their unique identifier
   */
  getById(id: string): Observable<User | null> {
    const user = this.users.find((u) => u.id === id);
    return of(user || null).pipe(delay(300));
  }

  /**
   * Get a user by their email address
   */
  getByEmail(email: string): Observable<User | null> {
    const user = this.users.find((u) => u.email === email);
    return of(user || null).pipe(delay(300));
  }

  /**
   * Create a new user
   */
  create(userData: {
    email: string;
    firstName: string;
    lastName: string;
  }): Observable<User> {
    // Check if user already exists
    const existingUser = this.users.find((u) => u.email === userData.email);
    if (existingUser) {
      return throwError(
        () => new Error('User with this email already exists'),
      ).pipe(delay(300));
    }

    const newUser = new User(
      this.nextId.toString(),
      userData.email,
      userData.firstName,
      userData.lastName,
      new Date(),
      new Date(),
      true,
    );

    this.users.push(newUser);
    this.nextId++;

    return of(newUser).pipe(delay(500));
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
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return throwError(() => new Error('User not found')).pipe(delay(300));
    }

    const existingUser = this.users[userIndex];
    const updatedUser = existingUser.updateInfo(
      userData.firstName || existingUser.firstName,
      userData.lastName || existingUser.lastName,
    );

    this.users[userIndex] = updatedUser;
    return of(updatedUser).pipe(delay(500));
  }

  /**
   * Delete a user (soft delete - deactivate)
   */
  delete(id: string): Observable<boolean> {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return throwError(() => new Error('User not found')).pipe(delay(300));
    }

    const user = this.users[userIndex];
    if (!user.isActive) {
      return throwError(() => new Error('User is already inactive')).pipe(
        delay(300),
      );
    }

    this.users[userIndex] = user.deactivate();
    return of(true).pipe(delay(500));
  }

  /**
   * Permanently delete a user (hard delete)
   */
  permanentDelete(id: string): Observable<boolean> {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return throwError(() => new Error('User not found')).pipe(delay(300));
    }

    const user = this.users[userIndex];
    if (user.isActive) {
      return throwError(
        () =>
          new Error('Cannot permanently delete active user. Deactivate first.'),
      ).pipe(delay(300));
    }

    this.users.splice(userIndex, 1);
    return of(true).pipe(delay(500));
  }

  /**
   * Check if a user exists by email
   */
  existsByEmail(email: string): Observable<boolean> {
    const exists = this.users.some((u) => u.email === email);
    return of(exists).pipe(delay(200));
  }

  /**
   * Get users created within a date range
   */
  getByDateRange(startDate: Date, endDate: Date): Observable<User[]> {
    const filteredUsers = this.users.filter(
      (user) => user.createdAt >= startDate && user.createdAt <= endDate,
    );
    return of(filteredUsers).pipe(delay(400));
  }

  /**
   * Get active users count
   */
  getActiveUsersCount(): Observable<number> {
    const count = this.users.filter((u) => u.isActive).length;
    return of(count).pipe(delay(200));
  }

  /**
   * Search users by name or email
   */
  search(query: string, limit?: number): Observable<User[]> {
    const searchTerm = query.toLowerCase();
    let results = this.users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm),
    );

    if (limit && limit > 0) {
      results = results.slice(0, limit);
    }

    return of(results).pipe(delay(300));
  }
}
