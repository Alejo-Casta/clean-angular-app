import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Domain imports
import {
  User,
  IUserRepository,
  GetUserUseCase,
  CreateUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  ListUsersUseCase,
} from '../../domain';

// Application DTOs
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UserListResponseDto,
  UserListQueryDto,
  UserSearchDto,
  DateRangeDto,
  UserStatsDto,
} from '../dto/user.dto';

// Injection tokens
import { USER_REPOSITORY_TOKEN } from '../../di/injection-tokens';

/**
 * User Application Service
 * This service orchestrates the use cases and handles data transformation
 * between the domain layer and the presentation layer
 */
@Injectable({
  providedIn: 'root',
})
export class UserApplicationService {
  private getUserUseCase: GetUserUseCase;
  private createUserUseCase: CreateUserUseCase;
  private updateUserUseCase: UpdateUserUseCase;
  private deleteUserUseCase: DeleteUserUseCase;
  private listUsersUseCase: ListUsersUseCase;

  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private userRepository: IUserRepository,
  ) {
    // Initialize use cases
    this.getUserUseCase = new GetUserUseCase(userRepository);
    this.createUserUseCase = new CreateUserUseCase(userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(userRepository);
    this.listUsersUseCase = new ListUsersUseCase(userRepository);
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<UserResponseDto | null> {
    return this.getUserUseCase
      .execute(id)
      .pipe(map((user) => (user ? this.mapUserToDto(user) : null)));
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): Observable<UserResponseDto | null> {
    return this.getUserUseCase
      .executeByEmail(email)
      .pipe(map((user) => (user ? this.mapUserToDto(user) : null)));
  }

  /**
   * Create a new user
   */
  createUser(createUserDto: CreateUserDto): Observable<UserResponseDto> {
    return this.createUserUseCase
      .execute(createUserDto)
      .pipe(map((user) => this.mapUserToDto(user)));
  }

  /**
   * Update user information
   */
  updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Observable<UserResponseDto> {
    return this.updateUserUseCase
      .execute(id, updateUserDto)
      .pipe(map((user) => this.mapUserToDto(user)));
  }

  /**
   * Soft delete user (deactivate)
   */
  deleteUser(id: string): Observable<boolean> {
    return this.deleteUserUseCase.executeSoftDelete(id);
  }

  /**
   * Permanently delete user
   */
  permanentlyDeleteUser(id: string): Observable<boolean> {
    return this.deleteUserUseCase.executeHardDelete(id);
  }

  /**
   * Get paginated list of users
   */
  getUsers(query: UserListQueryDto = {}): Observable<UserListResponseDto> {
    return this.listUsersUseCase
      .execute({
        page: query.page,
        limit: query.limit,
        search: query.search,
        isActive: query.isActive,
      })
      .pipe(
        map((result) => ({
          users: result.users.map((user) => this.mapUserToDto(user)),
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        })),
      );
  }

  /**
   * Search users
   */
  searchUsers(searchDto: UserSearchDto): Observable<UserResponseDto[]> {
    return this.listUsersUseCase
      .executeSearch(searchDto.query, searchDto.limit)
      .pipe(map((users) => users.map((user) => this.mapUserToDto(user))));
  }

  /**
   * Get users by date range
   */
  getUsersByDateRange(dateRange: DateRangeDto): Observable<UserResponseDto[]> {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    return this.listUsersUseCase
      .executeByDateRange(startDate, endDate)
      .pipe(map((users) => users.map((user) => this.mapUserToDto(user))));
  }

  /**
   * Get user statistics
   */
  getUserStats(): Observable<UserStatsDto> {
    return this.listUsersUseCase.executeGetActiveCount().pipe(
      map((activeCount) => ({
        totalUsers: 0, // This would need additional implementation
        activeUsers: activeCount,
        inactiveUsers: 0, // This would need additional implementation
        newUsersThisMonth: 0, // This would need additional implementation
      })),
    );
  }

  /**
   * Map User entity to UserResponseDto
   */
  private mapUserToDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      isActive: user.isActive,
    };
  }
}
