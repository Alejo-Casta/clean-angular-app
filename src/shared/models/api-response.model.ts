/**
 * Generic API Response Model
 * Used for standardizing API responses across the application
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}

/**
 * Paginated API Response Model
 */
export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Error Response Model
 */
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  timestamp: string;
  statusCode?: number;
}
