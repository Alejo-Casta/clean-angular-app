# Clean Angular App - Clean Architecture Implementation

A production-ready Angular 20 application demonstrating **Clean Architecture** principles with TypeScript, featuring a complete user management system that showcases proper separation of concerns between domain, application, infrastructure, and presentation layers.

## 🏗️ Architecture Overview

This application implements **Clean Architecture** (also known as Hexagonal Architecture or Ports and Adapters) as defined by Robert C. Martin. The architecture ensures:

- **Independence of Frameworks**: The business logic doesn't depend on Angular or any external framework
- **Testability**: Business rules can be tested without UI, database, or external services
- **Independence of UI**: The UI can change without changing the business logic
- **Independence of Database**: Business rules are not bound to any specific database
- **Independence of External Services**: Business rules don't know anything about the outside world

### Layer Structure

```
src/
├── core/                           # Core business logic (Framework-independent)
│   ├── domain/                     # Enterprise business rules
│   │   ├── entities/              # Business entities with rules
│   │   ├── repositories/          # Repository interfaces (contracts)
│   │   ├── use-cases/             # Application business rules
│   │   └── errors/                # Domain-specific errors
│   ├── application/               # Application business rules
│   │   ├── dto/                   # Data Transfer Objects
│   │   └── services/              # Application services (orchestration)
│   ├── infrastructure/            # External concerns (Framework-dependent)
│   │   ├── repositories/          # Repository implementations
│   │   └── http/                  # HTTP services and API communication
│   └── di/                        # Dependency injection configuration
├── features/                      # Feature modules (Presentation layer)
│   └── user-management/           # User management feature
│       ├── components/            # Angular components
│       ├── services/              # UI-specific services
│       └── models/                # UI-specific models
├── shared/                        # Shared utilities and services
│   ├── components/                # Reusable UI components
│   ├── services/                  # Cross-cutting concerns
│   ├── guards/                    # Route guards
│   ├── interceptors/              # HTTP interceptors
│   └── utils/                     # Utility functions
└── environments/                  # Environment configurations
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 18.19.0 or higher
- **npm**: Version 9.0.0 or higher
- **Angular CLI**: Version 20.0.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clean-angular-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200/`

### Available Scripts

```bash
# Development
npm start                    # Start development server
npm run build               # Build for production
npm run watch               # Build and watch for changes

# Testing
npm test                    # Run unit tests

# Code Quality
npm run lint                # Run ESLint
npm run lint:fix            # Fix ESLint issues
npm run format              # Format code with Prettier
npm run format:check        # Check code formatting
npm run code-quality        # Run all quality checks
npm run code-quality:fix    # Fix all quality issues

# Server-Side Rendering
npm run serve:ssr           # Serve SSR build
```

## 🏛️ Clean Architecture Implementation

### Domain Layer (`src/core/domain/`)

The **Domain Layer** contains the enterprise business rules and is the most stable layer.

#### Entities
Business objects that encapsulate enterprise-wide business rules:

```typescript
// src/core/domain/entities/user.entity.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly isActive: boolean = true
  ) {
    this.validateEmail(email);
    this.validateName(firstName, 'First name');
    this.validateName(lastName, 'Last name');
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  updateInfo(firstName: string, lastName: string): User {
    return new User(
      this.id, this.email, firstName, lastName,
      this.createdAt, new Date(), this.isActive
    );
  }
}
```

#### Repository Interfaces
Contracts that define how data should be accessed:

```typescript
// src/core/domain/repositories/user.repository.interface.ts
export interface IUserRepository {
  getAll(options?: FilterOptions): Observable<PaginatedResult<User>>;
  getById(id: string): Observable<User | null>;
  create(userData: CreateUserData): Observable<User>;
  update(id: string, userData: UpdateUserData): Observable<User>;
  delete(id: string): Observable<boolean>;
}
```

### Application Layer (`src/core/application/`)

The **Application Layer** orchestrates the flow of data to and from the use cases.

#### Application Services
Coordinate use cases and handle data transformation:

```typescript
// src/core/application/services/user-application.service.ts
@Injectable({ providedIn: 'root' })
export class UserApplicationService {
  constructor(@Inject(USER_REPOSITORY_TOKEN) private userRepository: IUserRepository) {
    this.createUserUseCase = new CreateUserUseCase(userRepository);
    this.getUserUseCase = new GetUserUseCase(userRepository);
    // ... other use cases
  }

  createUser(createUserDto: CreateUserDto): Observable<UserResponseDto> {
    return this.createUserUseCase.execute(createUserDto).pipe(
      map(user => this.mapUserToDto(user))
    );
  }
}
```

#### Data Transfer Objects (DTOs)
Define the structure of data flowing between layers:

```typescript
// src/core/application/dto/user.dto.ts
export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
}

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
```

### Infrastructure Layer (`src/core/infrastructure/`)

The **Infrastructure Layer** contains implementations of interfaces defined in the domain layer.

#### Repository Implementations
Concrete implementations of repository interfaces:

```typescript
// src/core/infrastructure/repositories/user.repository.ts
@Injectable({ providedIn: 'root' })
export class UserRepository implements IUserRepository {
  constructor(private userHttpService: UserHttpService) {}

  getById(id: string): Observable<User | null> {
    return this.userHttpService.getUserById(id).pipe(
      map(userData => userData ? this.mapToUser(userData) : null),
      catchError(error => {
        if (error.status === 404) return of(null);
        return throwError(() => DomainErrorFactory.fromHttpError(error));
      })
    );
  }
}
```

#### HTTP Services
Handle external API communication:

```typescript
// src/core/infrastructure/http/user-http.service.ts
@Injectable({ providedIn: 'root' })
export class UserHttpService {
  constructor(private http: HttpClient) {}

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/users/${id}`);
  }
}
```

### Presentation Layer (`src/features/`)

The **Presentation Layer** contains Angular-specific code and UI components.

#### Components
Angular components that handle user interaction:

```typescript
// src/features/user-management/components/user-list.component.ts
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  constructor(
    private userApplicationService: UserApplicationService,
    private notificationService: NotificationService
  ) {}

  loadUsers(): void {
    this.userApplicationService.getUsers(this.queryParams).subscribe({
      next: (response) => this.users = response.users,
      error: (error) => this.handleError(error)
    });
  }
}
```

## 🔧 Dependency Injection Configuration

The application uses Angular's DI system to implement the Dependency Inversion Principle:

```typescript
// src/core/di/providers.ts
export const coreProviders: Provider[] = [
  {
    provide: USER_REPOSITORY_TOKEN,
    useClass: environment.useMockData ? UserMockRepository : UserRepository
  },
  {
    provide: ErrorHandler,
    useClass: GlobalErrorHandlerService
  },
  // ... other providers
];
```

## 🧪 Testing Strategy

The clean architecture makes testing straightforward by allowing each layer to be tested in isolation.

### Domain Layer Tests
Test business logic without external dependencies:

```typescript
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: jasmine.SpyObj<IUserRepository>;

  beforeEach(() => {
    mockRepository = jasmine.createSpyObj('IUserRepository', ['existsByEmail', 'create']);
    useCase = new CreateUserUseCase(mockRepository);
  });

  it('should create user when email does not exist', () => {
    mockRepository.existsByEmail.and.returnValue(of(false));
    mockRepository.create.and.returnValue(of(expectedUser));

    useCase.execute(validUserData).subscribe(user => {
      expect(user).toBe(expectedUser);
    });
  });
});
```

### Running Tests

```bash
npm test                    # Run all tests
npm run test:coverage       # Run tests with coverage report
```

## 📋 Features Demonstrated

### User Management System
Complete CRUD operations for user management:

- **List Users**: Paginated list with search and filtering
- **View User**: Detailed user information display
- **Create User**: Form validation and user creation
- **Edit User**: Update user information
- **Delete User**: Soft delete with confirmation

### Technical Features
- **Clean Architecture**: Proper separation of concerns
- **Dependency Injection**: Configurable implementations
- **Error Handling**: Domain-specific error handling
- **Validation**: Business rule validation in entities
- **Reactive Programming**: RxJS for data flow
- **Type Safety**: Full TypeScript implementation
- **Testing**: Comprehensive unit test coverage
- **Code Quality**: ESLint and Prettier configuration

## 🛠️ Development Guidelines

### Adding New Features

1. **Start with the Domain**: Define entities and business rules
2. **Create Use Cases**: Implement application-specific business logic
3. **Define Interfaces**: Create repository and service interfaces
4. **Implement Infrastructure**: Create concrete implementations
5. **Build UI**: Create Angular components and services
6. **Write Tests**: Test each layer independently

### Code Quality

The project includes comprehensive code quality tools:

- **ESLint**: Enforces coding standards and catches errors
- **Prettier**: Ensures consistent code formatting
- **TypeScript**: Provides type safety and better tooling
- **Angular Strict Mode**: Enables stricter type checking

### Best Practices

- **Single Responsibility**: Each class has one reason to change
- **Dependency Inversion**: Depend on abstractions, not concretions
- **Open/Closed Principle**: Open for extension, closed for modification
- **Interface Segregation**: Many client-specific interfaces
- **Don't Repeat Yourself**: Avoid code duplication

## 🚀 Production Deployment

### Build for Production

```bash
npm run build               # Creates optimized production build
```

### Environment Configuration

Configure different environments in `src/environments/`:

- `environment.ts`: Development configuration
- `environment.prod.ts`: Production configuration

### Server-Side Rendering

The application supports SSR for better SEO and performance:

```bash
npm run serve:ssr           # Serve with SSR
```

## 📚 Additional Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Angular Documentation](https://angular.dev/)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the established architecture patterns
4. Write tests for new functionality
5. Ensure code quality checks pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

#### Use Cases
Application-specific business rules:

```typescript
// src/core/domain/use-cases/create-user.use-case.ts
export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  execute(userData: CreateUserData): Observable<User> {
    this.validateUserData(userData);
    
    return this.userRepository.existsByEmail(userData.email).pipe(
      switchMap(exists => {
        if (exists) {
          return throwError(() => new Error('User already exists'));
        }
        return this.userRepository.create(userData);
      })
    );
  }
}
```
