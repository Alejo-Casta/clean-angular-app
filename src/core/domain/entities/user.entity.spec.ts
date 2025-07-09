import { User } from './user.entity';

describe('User Entity', () => {
  const validUserData = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    isActive: true,
  };

  describe('Constructor', () => {
    it('should create a user with valid data', () => {
      const user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.firstName,
        validUserData.lastName,
        validUserData.createdAt,
        validUserData.updatedAt,
        validUserData.isActive,
      );

      expect(user.id).toBe(validUserData.id);
      expect(user.email).toBe(validUserData.email);
      expect(user.firstName).toBe(validUserData.firstName);
      expect(user.lastName).toBe(validUserData.lastName);
      expect(user.isActive).toBe(validUserData.isActive);
    });

    it('should throw error for invalid email', () => {
      expect(() => {
        new User(
          validUserData.id,
          'invalid-email',
          validUserData.firstName,
          validUserData.lastName,
          validUserData.createdAt,
          validUserData.updatedAt,
        );
      }).toThrow('Invalid email format');
    });

    it('should throw error for invalid first name', () => {
      expect(() => {
        new User(
          validUserData.id,
          validUserData.email,
          'A', // Too short
          validUserData.lastName,
          validUserData.createdAt,
          validUserData.updatedAt,
        );
      }).toThrow('First name must be at least 2 characters long');
    });

    it('should throw error for invalid last name', () => {
      expect(() => {
        new User(
          validUserData.id,
          validUserData.email,
          validUserData.firstName,
          '', // Empty
          validUserData.createdAt,
          validUserData.updatedAt,
        );
      }).toThrow('Last name must be at least 2 characters long');
    });
  });

  describe('Getters', () => {
    let user: User;

    beforeEach(() => {
      user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.firstName,
        validUserData.lastName,
        validUserData.createdAt,
        validUserData.updatedAt,
        validUserData.isActive,
      );
    });

    it('should return full name', () => {
      expect(user.fullName).toBe('John Doe');
    });

    it('should return user active status', () => {
      expect(user.isUserActive).toBe(true);
    });
  });

  describe('Methods', () => {
    let user: User;

    beforeEach(() => {
      user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.firstName,
        validUserData.lastName,
        validUserData.createdAt,
        validUserData.updatedAt,
        validUserData.isActive,
      );
    });

    it('should update user info', () => {
      const updatedUser = user.updateInfo('Jane', 'Smith');

      expect(updatedUser.firstName).toBe('Jane');
      expect(updatedUser.lastName).toBe('Smith');
      expect(updatedUser.fullName).toBe('Jane Smith');
      expect(updatedUser.id).toBe(user.id);
      expect(updatedUser.email).toBe(user.email);
      expect(updatedUser.updatedAt).not.toBe(user.updatedAt);
    });

    it('should deactivate user', () => {
      const deactivatedUser = user.deactivate();

      expect(deactivatedUser.isActive).toBe(false);
      expect(deactivatedUser.id).toBe(user.id);
      expect(deactivatedUser.updatedAt).not.toBe(user.updatedAt);
    });

    it('should activate user', () => {
      const inactiveUser = user.deactivate();
      const activatedUser = inactiveUser.activate();

      expect(activatedUser.isActive).toBe(true);
      expect(activatedUser.id).toBe(user.id);
    });
  });

  describe('Serialization', () => {
    let user: User;

    beforeEach(() => {
      user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.firstName,
        validUserData.lastName,
        validUserData.createdAt,
        validUserData.updatedAt,
        validUserData.isActive,
      );
    });

    it('should serialize to JSON', () => {
      const json = user.toJSON();

      expect(json['id']).toBe(user.id);
      expect(json['email']).toBe(user.email);
      expect(json['firstName']).toBe(user.firstName);
      expect(json['lastName']).toBe(user.lastName);
      expect(json['fullName']).toBe(user.fullName);
      expect(json['isActive']).toBe(user.isActive);
      expect(json['createdAt']).toBe(user.createdAt.toISOString());
      expect(json['updatedAt']).toBe(user.updatedAt.toISOString());
    });

    it('should deserialize from JSON', () => {
      const json = user.toJSON();
      const deserializedUser = User.fromJSON(json);

      expect(deserializedUser.id).toBe(user.id);
      expect(deserializedUser.email).toBe(user.email);
      expect(deserializedUser.firstName).toBe(user.firstName);
      expect(deserializedUser.lastName).toBe(user.lastName);
      expect(deserializedUser.isActive).toBe(user.isActive);
      expect(deserializedUser.createdAt.getTime()).toBe(
        user.createdAt.getTime(),
      );
      expect(deserializedUser.updatedAt.getTime()).toBe(
        user.updatedAt.getTime(),
      );
    });
  });
});
