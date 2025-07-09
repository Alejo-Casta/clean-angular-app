import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user.repository.interface';

/**
 * List Users Use Case - Encapsulates the business logic for retrieving user lists
 * This use case handles pagination, filtering, and search functionality
 */
export class ListUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Execute the use case to get a paginated list of users
   */
  execute(options?: {
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
    // Validate and set default options
    const validatedOptions = this.validateAndSetDefaults(options);

    return this.userRepository.getAll(validatedOptions);
  }

  /**
   * Execute search for users
   */
  executeSearch(query: string, limit?: number): Observable<User[]> {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query is required');
    }

    if (query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }

    const searchLimit = limit && limit > 0 ? Math.min(limit, 100) : 20;

    return this.userRepository.search(query.trim(), searchLimit);
  }

  /**
   * Get users by date range
   */
  executeByDateRange(startDate: Date, endDate: Date): Observable<User[]> {
    if (!startDate || !endDate) {
      throw new Error('Both start date and end date are required');
    }

    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    const now = new Date();
    if (startDate > now) {
      throw new Error('Start date cannot be in the future');
    }

    return this.userRepository.getByDateRange(startDate, endDate);
  }

  /**
   * Get active users count
   */
  executeGetActiveCount(): Observable<number> {
    return this.userRepository.getActiveUsersCount();
  }

  /**
   * Validate options and set defaults
   */
  private validateAndSetDefaults(options?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
  } {
    const defaults = {
      page: 1,
      limit: 10,
    };

    if (!options) {
      return defaults;
    }

    // Validate page
    let page = options.page || defaults.page;
    if (page < 1) {
      page = defaults.page;
    }

    // Validate limit
    let limit = options.limit || defaults.limit;
    if (limit < 1) {
      limit = defaults.limit;
    }
    if (limit > 100) {
      limit = 100; // Maximum limit for performance
    }

    // Validate search
    let search = options.search;
    if (search && search.trim().length < 2) {
      search = undefined; // Ignore search terms that are too short
    }

    return {
      page,
      limit,
      search: search?.trim(),
      isActive: options.isActive,
    };
  }
}
