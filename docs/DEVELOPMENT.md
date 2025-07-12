# Development Workflow & Guidelines

## Overview

This document outlines the development workflow, Git branching strategy, and guidelines for contributing to the Clean Angular App project with PrimeNG integration.

## Git Branching Strategy

### Branch Types

#### Main Branches
- **`main`**: Production-ready code, always deployable
- **`develop`**: Integration branch for features (if using GitFlow)

#### Feature Branches
- **`feature/`**: New features and enhancements
- **`bugfix/`**: Bug fixes for existing features
- **`hotfix/`**: Critical fixes for production issues
- **`chore/`**: Maintenance tasks, dependency updates

### Branch Naming Convention

```
feature/add-primeng              # PrimeNG integration
feature/user-profile-page        # New user profile feature
bugfix/user-validation-error     # Fix user validation bug
hotfix/security-vulnerability    # Critical security fix
chore/update-dependencies        # Dependency updates
```

### Current Branch: `feature/add-primeng`

This branch demonstrates the integration of PrimeNG 20.0.0-rc.3 with the existing clean architecture:

#### Branch Purpose
- Add PrimeNG UI component library
- Maintain clean architecture principles
- Ensure Angular 20 compatibility
- Implement zoneless change detection support

#### Changes Made
- Added PrimeNG 20.0.0-rc.3 and required dependencies
- Updated documentation to reflect UI library integration
- Configured package.json with proper descriptions and keywords
- Maintained separation of concerns in architecture

## Development Workflow

### 1. Setting Up Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd clean-angular-app

# Install dependencies (using bun - recommended)
bun install

# Or using npm
npm install

# Start development server
bun start
```

### 2. Creating a New Feature

```bash
# Create and switch to feature branch
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Make your changes following clean architecture principles
# ... development work ...

# Run tests and quality checks
bun test
bun run lint
bun run format:check

# Commit changes
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name
```

### 3. Code Quality Standards

#### Before Committing
```bash
# Run all quality checks
bun run code-quality

# Fix any issues
bun run code-quality:fix

# Run tests
bun test

# Build to ensure no compilation errors
bun run build
```

#### Commit Message Format
Follow conventional commits:
```
feat: add new user management feature
fix: resolve user validation error
docs: update architecture documentation
chore: update dependencies to latest versions
test: add unit tests for user service
```

## Clean Architecture Development Guidelines

### Adding New Features

#### 1. Domain Layer First
```typescript
// 1. Define entity
export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number
  ) {
    this.validatePrice(price);
  }
}

// 2. Define repository interface
export interface IProductRepository {
  getById(id: string): Observable<Product | null>;
  create(product: CreateProductData): Observable<Product>;
}

// 3. Create use case
export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}
  
  execute(data: CreateProductData): Observable<Product> {
    // Business logic here
  }
}
```

#### 2. Application Layer
```typescript
// Application service
@Injectable({ providedIn: 'root' })
export class ProductApplicationService {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN) 
    private productRepository: IProductRepository
  ) {}
  
  createProduct(dto: CreateProductDto): Observable<ProductResponseDto> {
    const useCase = new CreateProductUseCase(this.productRepository);
    return useCase.execute(dto).pipe(
      map(product => this.mapToDto(product))
    );
  }
}
```

#### 3. Infrastructure Layer
```typescript
// Repository implementation
@Injectable({ providedIn: 'root' })
export class ProductRepository implements IProductRepository {
  constructor(private httpService: ProductHttpService) {}
  
  getById(id: string): Observable<Product | null> {
    return this.httpService.getProduct(id).pipe(
      map(data => data ? this.mapToProduct(data) : null)
    );
  }
}
```

#### 4. Presentation Layer with PrimeNG
```typescript
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  template: `
    <p-table [value]="products" [loading]="loading">
      <ng-template pTemplate="header">
        <tr><th>Name</th><th>Price</th><th>Actions</th></tr>
      </ng-template>
      <ng-template pTemplate="body" let-product>
        <tr>
          <td>{{ product.name }}</td>
          <td>{{ product.price | currency }}</td>
          <td>
            <p-button 
              (onClick)="editProduct(product.id)" 
              label="Edit"
              icon="pi pi-pencil">
            </p-button>
          </td>
        </tr>
      </ng-template>
    </p-table>
  `
})
export class ProductListComponent {
  constructor(
    private productApplicationService: ProductApplicationService
  ) {}
}
```

### PrimeNG Integration Guidelines

#### Component Usage
- Import only required PrimeNG modules
- Use PrimeNG components for consistent UI
- Maintain business logic in application services
- Handle events through component methods

#### Theming
- Configure themes in `src/styles.scss`
- Use CSS custom properties for customization
- Maintain consistent design system

#### Performance
- Leverage virtual scrolling for large datasets
- Use lazy loading where appropriate
- Optimize change detection with zoneless mode

## Testing Strategy

### Unit Testing
```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test user.service.spec.ts
```

### Test Structure by Layer
- **Domain**: Test business logic without dependencies
- **Application**: Test use case orchestration
- **Infrastructure**: Test data access and external services
- **Presentation**: Test component behavior and user interactions

## Code Review Guidelines

### Review Checklist
- [ ] Follows clean architecture principles
- [ ] Business logic is in appropriate layer
- [ ] PrimeNG components used correctly
- [ ] Tests cover new functionality
- [ ] Documentation updated if needed
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Performance considerations addressed

### Architecture Compliance
- [ ] Domain layer has no framework dependencies
- [ ] Repository interfaces defined in domain layer
- [ ] UI components only in presentation layer
- [ ] Dependency injection properly configured

## Deployment

### Build Process
```bash
# Production build
bun run build

# SSR build
bun run build:ssr

# Serve SSR
bun run serve:ssr
```

### Environment Configuration
- Development: `src/environments/environment.ts`
- Production: `src/environments/environment.prod.ts`

## Troubleshooting

### Common Issues

#### PrimeNG Styling Issues
- Ensure theme CSS is imported in `src/styles.scss`
- Check for CSS conflicts with custom styles
- Verify PrimeNG version compatibility

#### Zoneless Change Detection
- Manually trigger change detection when needed
- Use OnPush change detection strategy
- Avoid relying on automatic change detection

#### Build Errors
- Check TypeScript strict mode compliance
- Verify all imports are correct
- Ensure no circular dependencies

## Resources

- [Clean Architecture Guide](./ARCHITECTURE.md)
- [PrimeNG Documentation](https://primeng.org/)
- [Angular Documentation](https://angular.dev/)
- [Conventional Commits](https://www.conventionalcommits.org/)
