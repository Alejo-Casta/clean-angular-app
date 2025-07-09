import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Application layer imports
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from '../../../core/application';

// Shared utilities
import {
  isValidEmail,
  isValidName,
} from '../../../shared/utils/validation.utils';

/**
 * User Form Component
 * Reusable form component for creating and editing users
 */
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="user-form">
      <div class="form-group">
        <label for="email">Email *</label>
        <input
          id="email"
          type="email"
          formControlName="email"
          class="form-control"
          [class.is-invalid]="isFieldInvalid('email')"
          [readonly]="isEditMode"
        />
        <div *ngIf="isFieldInvalid('email')" class="invalid-feedback">
          <div *ngIf="userForm.get('email')?.errors?.['required']">
            Email is required
          </div>
          <div *ngIf="userForm.get('email')?.errors?.['email']">
            Please enter a valid email
          </div>
          <div *ngIf="userForm.get('email')?.errors?.['invalidEmail']">
            Invalid email format
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="firstName">First Name *</label>
        <input
          id="firstName"
          type="text"
          formControlName="firstName"
          class="form-control"
          [class.is-invalid]="isFieldInvalid('firstName')"
        />
        <div *ngIf="isFieldInvalid('firstName')" class="invalid-feedback">
          <div *ngIf="userForm.get('firstName')?.errors?.['required']">
            First name is required
          </div>
          <div *ngIf="userForm.get('firstName')?.errors?.['minlength']">
            First name must be at least 2 characters
          </div>
          <div *ngIf="userForm.get('firstName')?.errors?.['invalidName']">
            First name can only contain letters and spaces
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="lastName">Last Name *</label>
        <input
          id="lastName"
          type="text"
          formControlName="lastName"
          class="form-control"
          [class.is-invalid]="isFieldInvalid('lastName')"
        />
        <div *ngIf="isFieldInvalid('lastName')" class="invalid-feedback">
          <div *ngIf="userForm.get('lastName')?.errors?.['required']">
            Last name is required
          </div>
          <div *ngIf="userForm.get('lastName')?.errors?.['minlength']">
            Last name must be at least 2 characters
          </div>
          <div *ngIf="userForm.get('lastName')?.errors?.['invalidName']">
            Last name can only contain letters and spaces
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" (click)="onCancel()">
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          [disabled]="userForm.invalid || isSubmitting"
        >
          {{
            isSubmitting
              ? 'Saving...'
              : isEditMode
                ? 'Update User'
                : 'Create User'
          }}
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .user-form {
        max-width: 500px;
        margin: 0 auto;
      }

      .form-group {
        margin-bottom: 20px;
      }

      label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: #333;
      }

      .form-control {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        transition: border-color 0.3s ease;
      }

      .form-control:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      }

      .form-control.is-invalid {
        border-color: #dc3545;
      }

      .form-control[readonly] {
        background-color: #f8f9fa;
        opacity: 0.8;
      }

      .invalid-feedback {
        display: block;
        width: 100%;
        margin-top: 5px;
        font-size: 12px;
        color: #dc3545;
      }

      .form-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 30px;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        display: inline-block;
        transition: background-color 0.3s ease;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-primary {
        background-color: #007bff;
        color: white;
      }

      .btn-primary:hover:not(:disabled) {
        background-color: #0056b3;
      }

      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background-color: #545b62;
      }
    `,
  ],
})
export class UserFormComponent implements OnInit, OnDestroy {
  @Input() user: UserResponseDto | null = null;
  @Input() isSubmitting = false;
  @Output() createUser = new EventEmitter<CreateUserDto>();
  @Output() updateUser = new EventEmitter<UpdateUserDto>();
  @Output() formCancel = new EventEmitter<void>();

  userForm: FormGroup;
  isEditMode = false;

  private destroy$ = new Subject<void>();

  constructor(private formBuilder: FormBuilder) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    this.isEditMode = !!this.user;

    if (this.user) {
      this.populateForm(this.user);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Create the reactive form with validation
   */
  private createForm(): FormGroup {
    return this.formBuilder.group({
      email: [
        '',
        [Validators.required, Validators.email, this.customEmailValidator],
      ],
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          this.customNameValidator,
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          this.customNameValidator,
        ],
      ],
    });
  }

  /**
   * Custom email validator
   */
  private customEmailValidator(control: any) {
    if (!control.value) return null;
    return isValidEmail(control.value) ? null : { invalidEmail: true };
  }

  /**
   * Custom name validator
   */
  private customNameValidator(control: any) {
    if (!control.value) return null;
    return isValidName(control.value) ? null : { invalidName: true };
  }

  /**
   * Populate form with user data for editing
   */
  private populateForm(user: UserResponseDto): void {
    this.userForm.patchValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }

  /**
   * Check if a form field is invalid and has been touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;

      if (this.isEditMode) {
        // For updates, only send changed fields
        const updateData: UpdateUserDto = {};

        if (formValue.firstName !== this.user?.firstName) {
          updateData.firstName = formValue.firstName;
        }

        if (formValue.lastName !== this.user?.lastName) {
          updateData.lastName = formValue.lastName;
        }

        this.updateUser.emit(updateData);
      } else {
        // For creation, send all required fields
        const createData: CreateUserDto = {
          email: formValue.email,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
        };

        this.createUser.emit(createData);
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.userForm.controls).forEach((key) => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Handle form cancellation
   */
  onCancel(): void {
    this.formCancel.emit();
  }

  /**
   * Reset the form
   */
  resetForm(): void {
    this.userForm.reset();
    Object.keys(this.userForm.controls).forEach((key) => {
      this.userForm.get(key)?.setErrors(null);
    });
  }
}
