import { Observable, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IUserRepository } from '../repositories/user.repository.interface';

/**
 * Delete User Use Case - Encapsulates the business logic for user deletion
 * This use case handles both soft delete (deactivation) and hard delete operations
 */
export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Execute soft delete (deactivate user)
   */
  executeSoftDelete(id: string): Observable<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('User ID is required');
    }

    return this.userRepository.getById(id).pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('User not found'));
        }

        if (!user.isActive) {
          return throwError(() => new Error('User is already inactive'));
        }

        return this.userRepository.delete(id);
      }),
    );
  }

  /**
   * Execute hard delete (permanent deletion)
   * This should be used with extreme caution and proper authorization
   */
  executeHardDelete(id: string): Observable<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('User ID is required');
    }

    return this.userRepository.getById(id).pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error('User not found'));
        }

        // Business rule: Only inactive users can be permanently deleted
        if (user.isActive) {
          return throwError(
            () =>
              new Error(
                'Cannot permanently delete active user. Deactivate first.',
              ),
          );
        }

        return this.userRepository.permanentDelete(id);
      }),
    );
  }
}
