# Clean Architecture Documentation

## Overview

This document provides a detailed explanation of the Clean Architecture implementation in this Angular application.

## Architecture Principles

### 1. Dependency Rule
Dependencies can only point inward. Source code dependencies must point only toward higher-level policies.

```
Presentation Layer → Application Layer → Domain Layer
Infrastructure Layer → Domain Layer
```

### 2. Layer Responsibilities

#### Domain Layer (Core Business Logic)
- **Entities**: Enterprise business rules
- **Use Cases**: Application business rules  
- **Repository Interfaces**: Data access contracts
- **Domain Errors**: Business-specific exceptions

**Dependencies**: None (pure business logic)

#### Application Layer (Application Business Rules)
- **Application Services**: Orchestrate use cases
- **DTOs**: Data transfer objects
- **Error Handling**: Application-level error management

**Dependencies**: Domain Layer only

#### Infrastructure Layer (External Concerns)
- **Repository Implementations**: Data access implementations
- **HTTP Services**: External API communication
- **External Services**: Third-party integrations

**Dependencies**: Domain Layer interfaces

#### Presentation Layer (UI and Framework)
- **Components**: Angular UI components
- **Services**: UI-specific services
- **Guards**: Route protection
- **Interceptors**: HTTP request/response handling

**Dependencies**: Application Layer services

## Data Flow

### Request Flow (User Action → Business Logic → Data)
1. **User Interaction**: User clicks button in component
2. **Component**: Calls application service method
3. **Application Service**: Orchestrates use case execution
4. **Use Case**: Executes business logic using repository interface
5. **Repository Implementation**: Fetches/stores data via HTTP service
6. **HTTP Service**: Makes API call to external service

### Response Flow (Data → Business Logic → UI)
1. **HTTP Service**: Receives API response
2. **Repository Implementation**: Maps data to domain entities
3. **Use Case**: Applies business rules to entities
4. **Application Service**: Converts entities to DTOs
5. **Component**: Updates UI with response data

## Error Handling Strategy

### Domain Errors
Business rule violations are handled at the domain level:

```typescript
export class UserAlreadyExistsError extends DomainError {
  readonly code = 'USER_ALREADY_EXISTS';
  readonly userMessage = 'A user with this email already exists';
}
```

### Error Propagation
Errors flow through the layers maintaining context:

1. **Infrastructure**: HTTP errors → Domain errors
2. **Application**: Domain errors → User-friendly messages
3. **Presentation**: Display notifications to user

## Testing Strategy

### Unit Testing by Layer

#### Domain Layer Tests
- Test business logic in isolation
- Mock repository interfaces
- Focus on business rule validation

#### Application Layer Tests
- Test use case orchestration
- Mock repository implementations
- Verify DTO transformations

#### Infrastructure Layer Tests
- Test data access implementations
- Mock HTTP services
- Verify error handling

#### Presentation Layer Tests
- Test component behavior
- Mock application services
- Verify user interactions

## Dependency Injection

### Interface-Based DI
Use injection tokens for interfaces:

```typescript
export const USER_REPOSITORY_TOKEN = new InjectionToken<IUserRepository>('UserRepository');

// Provider configuration
{
  provide: USER_REPOSITORY_TOKEN,
  useClass: environment.useMockData ? UserMockRepository : UserRepository
}
```

### Benefits
- **Testability**: Easy to mock dependencies
- **Flexibility**: Switch implementations via configuration
- **Maintainability**: Loose coupling between layers

## Best Practices

### 1. Keep Domain Pure
- No framework dependencies in domain layer
- Business logic independent of external concerns
- Entities contain business rules and validation

### 2. Use Interfaces for Contracts
- Define repository interfaces in domain layer
- Implement interfaces in infrastructure layer
- Depend on abstractions, not concretions

### 3. Separate Concerns
- Each layer has a single responsibility
- Cross-cutting concerns handled by shared services
- Clear boundaries between layers

### 4. Error Handling
- Domain-specific errors for business rule violations
- Consistent error handling across layers
- User-friendly error messages in presentation layer

### 5. Testing
- Test each layer in isolation
- Mock external dependencies
- Focus on business logic testing

## Common Patterns

### Repository Pattern
Encapsulates data access logic:

```typescript
interface IUserRepository {
  getById(id: string): Observable<User | null>;
  create(userData: CreateUserData): Observable<User>;
}
```

### Use Case Pattern
Encapsulates application-specific business rules:

```typescript
class CreateUserUseCase {
  execute(userData: CreateUserData): Observable<User> {
    // Business logic here
  }
}
```

### DTO Pattern
Data transfer between layers:

```typescript
interface UserResponseDto {
  id: string;
  email: string;
  fullName: string;
}
```

## Benefits of This Architecture

### 1. Testability
- Business logic can be tested without UI or database
- Easy to mock dependencies
- Fast unit tests

### 2. Maintainability
- Clear separation of concerns
- Changes in one layer don't affect others
- Easy to understand and modify

### 3. Flexibility
- Can change UI framework without affecting business logic
- Can switch data sources without changing business rules
- Easy to add new features

### 4. Scalability
- Well-organized code structure
- Easy to add new features and modules
- Clear guidelines for development team

## Migration Guide

### From Traditional Angular Architecture

1. **Extract Business Logic**: Move business logic from services to use cases
2. **Create Domain Entities**: Replace data models with rich domain entities
3. **Define Repository Interfaces**: Abstract data access behind interfaces
4. **Implement Clean DI**: Use injection tokens for interfaces
5. **Add Error Handling**: Implement domain-specific error handling

### Gradual Migration
- Start with new features using clean architecture
- Gradually refactor existing features
- Maintain backward compatibility during transition
