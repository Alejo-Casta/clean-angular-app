import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * User HTTP Service
 * This service handles all HTTP communications for user-related operations
 * It belongs to the infrastructure layer and implements the actual data fetching
 */
@Injectable({
  providedIn: 'root',
})
export class UserHttpService {
  private readonly baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Get all users with optional query parameters
   */
  getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Observable<{
    users: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    let httpParams = new HttpParams();

    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.isActive !== undefined) {
      httpParams = httpParams.set('isActive', params.isActive.toString());
    }

    return this.http.get<{
      users: any[];
      total: number;
      page: number;
      limit: number;
    }>(this.baseUrl, { params: httpParams });
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);
    return this.http.get<any>(`${this.baseUrl}/by-email`, { params });
  }

  /**
   * Create a new user
   */
  createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
  }): Observable<any> {
    return this.http.post<any>(this.baseUrl, userData);
  }

  /**
   * Update user information
   */
  updateUser(
    id: string,
    userData: {
      firstName?: string;
      lastName?: string;
    },
  ): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, userData);
  }

  /**
   * Soft delete user (deactivate)
   */
  deleteUser(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/${id}`);
  }

  /**
   * Permanently delete user
   */
  permanentDeleteUser(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.baseUrl}/${id}/permanent`,
    );
  }

  /**
   * Check if user exists by email
   */
  checkUserExists(email: string): Observable<{ exists: boolean }> {
    const params = new HttpParams().set('email', email);
    return this.http.get<{ exists: boolean }>(`${this.baseUrl}/exists`, {
      params,
    });
  }

  /**
   * Search users
   */
  searchUsers(query: string, limit?: number): Observable<any[]> {
    let params = new HttpParams().set('q', query);
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get<any[]>(`${this.baseUrl}/search`, { params });
  }

  /**
   * Get users by date range
   */
  getUsersByDateRange(startDate: Date, endDate: Date): Observable<any[]> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get<any[]>(`${this.baseUrl}/date-range`, { params });
  }

  /**
   * Get active users count
   */
  getActiveUsersCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/active/count`);
  }
}
