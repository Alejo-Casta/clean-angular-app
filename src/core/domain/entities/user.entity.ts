/**
 * User Entity - Core business entity representing a user in the system
 * This entity contains the business rules and logic for user data
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly isActive: boolean = true,
  ) {
    this.validateEmail(email);
    this.validateName(firstName, 'First name');
    this.validateName(lastName, 'Last name');
  }

  /**
   * Get the full name of the user
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Check if the user is active
   */
  get isUserActive(): boolean {
    return this.isActive;
  }

  /**
   * Create a new user with updated information
   */
  updateInfo(firstName: string, lastName: string): User {
    return new User(
      this.id,
      this.email,
      firstName,
      lastName,
      this.createdAt,
      new Date(),
      this.isActive,
    );
  }

  /**
   * Deactivate the user
   */
  deactivate(): User {
    return new User(
      this.id,
      this.email,
      this.firstName,
      this.lastName,
      this.createdAt,
      new Date(),
      false,
    );
  }

  /**
   * Activate the user
   */
  activate(): User {
    return new User(
      this.id,
      this.email,
      this.firstName,
      this.lastName,
      this.createdAt,
      new Date(),
      true,
    );
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  /**
   * Validate name fields
   */
  private validateName(name: string, fieldName: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error(`${fieldName} must be at least 2 characters long`);
    }
  }

  /**
   * Convert entity to plain object for serialization
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      isActive: this.isActive,
    };
  }

  /**
   * Create User entity from plain object
   */
  static fromJSON(data: any): User {
    return new User(
      data.id,
      data.email,
      data.firstName,
      data.lastName,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.isActive,
    );
  }
}
