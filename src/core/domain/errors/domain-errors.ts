/**
 * Domain-specific error classes
 * These errors represent business rule violations and domain-specific issues
 */

/**
 * Base domain error class
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly userMessage: string;
  public readonly details?: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
  }
}

/**
 * User-related domain errors
 */
export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND';
  readonly userMessage = 'User not found';

  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
  }
}

export class UserAlreadyExistsError extends DomainError {
  readonly code = 'USER_ALREADY_EXISTS';
  readonly userMessage = 'A user with this email already exists';

  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}

export class InvalidUserDataError extends DomainError {
  readonly code = 'INVALID_USER_DATA';
  readonly userMessage = 'Invalid user data provided';

  constructor(message: string, validationErrors?: string[]) {
    super(message, validationErrors);
  }
}

export class UserInactiveError extends DomainError {
  readonly code = 'USER_INACTIVE';
  readonly userMessage = 'Cannot perform operation on inactive user';

  constructor(userId: string) {
    super(`User ${userId} is inactive`);
  }
}

/**
 * Validation errors
 */
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly userMessage = 'Validation failed';

  constructor(
    message: string,
    public readonly validationErrors: string[],
  ) {
    super(message);
  }
}

/**
 * Business rule violation errors
 */
export class BusinessRuleViolationError extends DomainError {
  readonly code = 'BUSINESS_RULE_VIOLATION';
  readonly userMessage = 'Business rule violation';

  constructor(
    message: string,
    public readonly rule: string,
  ) {
    super(message);
  }
}

/**
 * Infrastructure errors
 */
export class RepositoryError extends DomainError {
  readonly code = 'REPOSITORY_ERROR';
  readonly userMessage = 'Data access error occurred';

  constructor(
    message: string,
    public readonly operation: string,
  ) {
    super(message);
  }
}

export class NetworkError extends DomainError {
  readonly code = 'NETWORK_ERROR';
  readonly userMessage = 'Network connection error';

  constructor(message: string) {
    super(message);
  }
}

/**
 * Error factory for creating domain errors from different sources
 */
export class DomainErrorFactory {
  /**
   * Create domain error from HTTP error
   */
  static fromHttpError(httpError: any): DomainError {
    if (httpError.status === 404) {
      return new UserNotFoundError(httpError.url || 'unknown');
    }

    if (httpError.status === 409) {
      return new UserAlreadyExistsError(httpError.error?.email || 'unknown');
    }

    if (httpError.status === 400) {
      const validationErrors = httpError.error?.errors || [
        httpError.error?.message || 'Invalid data',
      ];
      return new InvalidUserDataError('Validation failed', validationErrors);
    }

    if (httpError.status === 0) {
      return new NetworkError('Network connection failed');
    }

    return new RepositoryError(
      httpError.message || 'Repository operation failed',
      httpError.url || 'unknown',
    );
  }

  /**
   * Create domain error from validation errors
   */
  static fromValidationErrors(errors: string[]): ValidationError {
    return new ValidationError('Validation failed', errors);
  }

  /**
   * Create business rule violation error
   */
  static businessRuleViolation(
    message: string,
    rule: string,
  ): BusinessRuleViolationError {
    return new BusinessRuleViolationError(message, rule);
  }
}
