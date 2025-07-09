/**
 * Data Transfer Objects for User operations
 * These DTOs are used to transfer data between layers and external systems
 */

/**
 * DTO for creating a new user
 */
export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * DTO for updating user information
 */
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
}

/**
 * DTO for user response data
 */
export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

/**
 * DTO for paginated user list response
 */
export interface UserListResponseDto {
  users: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * DTO for user list query parameters
 */
export interface UserListQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * DTO for user search parameters
 */
export interface UserSearchDto {
  query: string;
  limit?: number;
}

/**
 * DTO for date range query
 */
export interface DateRangeDto {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

/**
 * DTO for user statistics
 */
export interface UserStatsDto {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
}

/**
 * DTO for bulk operations
 */
export interface BulkUserOperationDto {
  userIds: string[];
  operation: 'activate' | 'deactivate' | 'delete';
}

/**
 * DTO for bulk operation result
 */
export interface BulkOperationResultDto {
  successful: string[];
  failed: Array<{
    id: string;
    error: string;
  }>;
  totalProcessed: number;
}
