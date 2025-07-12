# Developer Setup Guide

## Welcome to Clean Angular App

This guide will help new team members set up their development environment and understand the project structure, including PrimeNG integration and clean architecture principles.

## Prerequisites

### Required Software

1. **Node.js** (v18.19.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **Bun** (v1.1.0 or higher) - Recommended
   - Install: `curl -fsSL https://bun.sh/install | bash`
   - Alternative: Use npm (v9.0.0 or higher)
   - Verify installation: `bun --version`

3. **Angular CLI** (v20.0.0 or higher)
   ```bash
   # Using bun
   bun add -g @angular/cli
   
   # Using npm
   npm install -g @angular/cli
   ```

4. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Configure your identity:
     ```bash
     git config --global user.name "Your Name"
     git config --global user.email "your.email@company.com"
     ```

5. **IDE/Editor** (Recommended: VS Code)
   - [Visual Studio Code](https://code.visualstudio.com/)
   - Install recommended extensions (see [Extensions](#recommended-extensions))

## Project Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd clean-angular-app

# Install dependencies (using bun - recommended)
bun install

# Or using npm
npm install
```

### 2. Verify Installation

```bash
# Run tests to ensure everything works
bun test

# Build the project
bun run build

# Start development server
bun start
```

The application should be available at `http://localhost:4200/`

### 3. Verify PrimeNG Integration

Check that PrimeNG is properly installed:

```bash
# Check installed packages
bun pm ls | grep primeng
# Should show: primeng@20.0.0-rc.3

# Verify dependencies
bun pm ls | grep -E "(primeicons|@angular/animations|@angular/cdk)"
```

## Project Structure Overview

### Clean Architecture Layers

```
src/
├── core/                    # Business Logic (Framework Independent)
│   ├── domain/             # Enterprise Business Rules
│   │   ├── entities/       # Business entities with validation
│   │   ├── repositories/   # Data access contracts
│   │   ├── use-cases/      # Application business rules
│   │   └── errors/         # Domain-specific errors
│   ├── application/        # Application Business Rules
│   │   ├── dto/           # Data Transfer Objects
│   │   └── services/      # Application services
│   └── infrastructure/    # External Concerns
│       ├── repositories/  # Repository implementations
│       └── http/         # HTTP services
├── features/              # Feature Modules (Presentation Layer)
│   └── user-management/   # Example feature
│       ├── components/    # Angular components with PrimeNG
│       ├── services/      # UI-specific services
│       └── models/        # UI-specific models
├── shared/               # Shared Utilities
│   ├── components/       # Reusable UI components
│   ├── services/         # Cross-cutting concerns
│   └── utils/           # Utility functions
└── environments/        # Environment configurations
```

### Key Technologies

- **Angular 20**: Latest Angular with zoneless change detection
- **PrimeNG 20.0.0-rc.3**: Enterprise UI component library
- **TypeScript**: Type-safe development
- **RxJS**: Reactive programming
- **Bun**: Fast package manager and runtime

## Understanding PrimeNG Integration

### What is PrimeNG?

PrimeNG is a comprehensive UI component library for Angular applications, providing:
- 100+ enterprise-grade components
- Built-in accessibility (ARIA support)
- Extensive theming capabilities
- Angular 20 compatibility

### How PrimeNG Fits in Clean Architecture

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  ┌─────────────┐  ┌─────────────┐   │
│  │   Angular   │  │   PrimeNG   │   │
│  │ Components  │  │ Components  │   │
│  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│        Application Layer            │
│     (Business Logic Services)      │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│          Domain Layer               │
│    (Pure Business Logic)           │
└─────────────────────────────────────┘
```

**Key Principle**: PrimeNG components are ONLY used in the presentation layer and never contain business logic.

### Example Component Usage

```typescript
// ✅ Correct: PrimeNG in presentation layer
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  template: `
    <p-table [value]="users" [loading]="loading">
      <!-- PrimeNG table configuration -->
    </p-table>
  `
})
export class UserListComponent {
  constructor(
    private userApplicationService: UserApplicationService // Business logic
  ) {}
  
  loadUsers(): void {
    // Business logic handled by application service
    this.userApplicationService.getUsers().subscribe(/* ... */);
  }
}
```

## Development Workflow

### 1. Daily Development

```bash
# Start development server
bun start

# Run tests in watch mode (in another terminal)
bun test --watch

# Run linting
bun run lint

# Format code
bun run format
```

### 2. Before Committing

```bash
# Run all quality checks
bun run code-quality

# Fix any issues automatically
bun run code-quality:fix

# Ensure build works
bun run build
```

### 3. Creating New Features

Follow the clean architecture pattern:

1. **Start with Domain**: Define entities and business rules
2. **Create Use Cases**: Implement application business logic
3. **Define Interfaces**: Create repository contracts
4. **Implement Infrastructure**: Create concrete implementations
5. **Build UI**: Create Angular components with PrimeNG
6. **Write Tests**: Test each layer independently

## Common Development Tasks

### Adding a New PrimeNG Component

1. **Import the module**:
   ```typescript
   import { CalendarModule } from 'primeng/calendar';
   
   @Component({
     imports: [CommonModule, CalendarModule],
     // ...
   })
   ```

2. **Use in template**:
   ```html
   <p-calendar [(ngModel)]="selectedDate"></p-calendar>
   ```

3. **Handle events**:
   ```typescript
   onDateSelect(date: Date): void {
     // Handle through application service
     this.applicationService.updateDate(date);
   }
   ```

### Creating a New Feature Module

```bash
# Create feature directory structure
mkdir -p src/features/new-feature/{components,services,models}

# Create domain entities
mkdir -p src/core/domain/entities
mkdir -p src/core/domain/use-cases

# Create application services
mkdir -p src/core/application/services
mkdir -p src/core/application/dto

# Create infrastructure
mkdir -p src/core/infrastructure/repositories
mkdir -p src/core/infrastructure/http
```

### Running Tests

```bash
# All tests
bun test

# Specific test file
bun test user.service.spec.ts

# Tests with coverage
bun test --coverage

# Tests in watch mode
bun test --watch
```

## Recommended Extensions (VS Code)

Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "angular.ng-template",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json"
  ]
}
```

## Troubleshooting

### Common Issues

#### 1. PrimeNG Styles Not Loading
```bash
# Check if theme is imported in src/styles.scss
# Add if missing:
@import 'primeng/resources/themes/lara-light-blue/theme.css';
@import 'primeng/resources/primeng.min.css';
@import 'primeicons/primeicons.css';
```

#### 2. Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules bun.lockb
bun install

# Clear Angular cache
rm -rf .angular/cache
```

#### 3. Test Failures
```bash
# Update test snapshots if needed
bun test --updateSnapshot

# Check for missing imports in test files
```

#### 4. Zoneless Change Detection Issues
- Manually trigger change detection when needed
- Use OnPush change detection strategy
- Avoid relying on automatic change detection

## Getting Help

### Documentation
- [Architecture Guide](./ARCHITECTURE.md)
- [Development Workflow](./DEVELOPMENT.md)
- [PrimeNG Documentation](https://primeng.org/)

### Team Resources
- Code reviews: Follow the [review checklist](./DEVELOPMENT.md#code-review-guidelines)
- Architecture questions: Refer to clean architecture principles
- PrimeNG usage: Check component documentation and examples

### Best Practices
- Always maintain separation of concerns
- Keep business logic out of UI components
- Use PrimeNG components for consistent UI
- Write tests for all new functionality
- Follow the established coding standards

## Next Steps

1. **Explore the codebase**: Start with `src/features/user-management/`
2. **Read the documentation**: Review [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Run the application**: Get familiar with the user interface
4. **Make a small change**: Try adding a new PrimeNG component
5. **Ask questions**: Don't hesitate to reach out to the team

Welcome to the team! 🚀
