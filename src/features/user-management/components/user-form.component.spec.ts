import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { UserFormComponent } from './user-form.component';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    isActive: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFormComponent, ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Creation', () => {
    it('should create form with required validators', () => {
      expect(component.userForm).toBeTruthy();
      expect(component.userForm.get('email')).toBeTruthy();
      expect(component.userForm.get('firstName')).toBeTruthy();
      expect(component.userForm.get('lastName')).toBeTruthy();

      // Check required validators
      const emailControl = component.userForm.get('email');
      const firstNameControl = component.userForm.get('firstName');
      const lastNameControl = component.userForm.get('lastName');

      emailControl?.setValue('');
      firstNameControl?.setValue('');
      lastNameControl?.setValue('');

      expect(emailControl?.hasError('required')).toBe(true);
      expect(firstNameControl?.hasError('required')).toBe(true);
      expect(lastNameControl?.hasError('required')).toBe(true);
    });
  });

  describe('Edit Mode', () => {
    it('should populate form when user is provided', () => {
      component.user = mockUser;
      component.ngOnInit();

      expect(component.isEditMode).toBe(true);
      expect(component.userForm.get('email')?.value).toBe(mockUser.email);
      expect(component.userForm.get('firstName')?.value).toBe(
        mockUser.firstName,
      );
      expect(component.userForm.get('lastName')?.value).toBe(mockUser.lastName);
    });

    it('should make email field readonly in edit mode', () => {
      component.user = mockUser;
      component.ngOnInit();
      fixture.detectChanges();

      const emailInput = fixture.nativeElement.querySelector(
        'input[formControlName="email"]',
      );
      expect(emailInput.readOnly).toBe(true);
    });
  });

  describe('Create Mode', () => {
    it('should not be in edit mode when no user provided', () => {
      component.ngOnInit();

      expect(component.isEditMode).toBe(false);
    });

    it('should have empty form in create mode', () => {
      component.ngOnInit();

      expect(component.userForm.get('email')?.value).toBe('');
      expect(component.userForm.get('firstName')?.value).toBe('');
      expect(component.userForm.get('lastName')?.value).toBe('');
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should validate email format', () => {
      const emailControl = component.userForm.get('email');

      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);

      emailControl?.setValue('valid@example.com');
      expect(emailControl?.hasError('email')).toBe(false);
    });

    it('should validate custom email format', () => {
      const emailControl = component.userForm.get('email');

      emailControl?.setValue('test@');
      expect(emailControl?.hasError('invalidEmail')).toBe(true);

      emailControl?.setValue('test@example.com');
      expect(emailControl?.hasError('invalidEmail')).toBe(false);
    });

    it('should validate name minimum length', () => {
      const firstNameControl = component.userForm.get('firstName');
      const lastNameControl = component.userForm.get('lastName');

      firstNameControl?.setValue('A');
      lastNameControl?.setValue('B');

      expect(firstNameControl?.hasError('minlength')).toBe(true);
      expect(lastNameControl?.hasError('minlength')).toBe(true);

      firstNameControl?.setValue('John');
      lastNameControl?.setValue('Doe');

      expect(firstNameControl?.hasError('minlength')).toBe(false);
      expect(lastNameControl?.hasError('minlength')).toBe(false);
    });

    it('should validate name characters', () => {
      const firstNameControl = component.userForm.get('firstName');

      firstNameControl?.setValue('John123');
      expect(firstNameControl?.hasError('invalidName')).toBe(true);

      firstNameControl?.setValue('John');
      expect(firstNameControl?.hasError('invalidName')).toBe(false);
    });
  });

  describe('isFieldInvalid', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should return true for invalid touched field', () => {
      const emailControl = component.userForm.get('email');
      emailControl?.setValue('');
      emailControl?.markAsTouched();

      expect(component.isFieldInvalid('email')).toBe(true);
    });

    it('should return false for valid field', () => {
      const emailControl = component.userForm.get('email');
      emailControl?.setValue('test@example.com');
      emailControl?.markAsTouched();

      expect(component.isFieldInvalid('email')).toBe(false);
    });

    it('should return false for invalid untouched field', () => {
      const emailControl = component.userForm.get('email');
      emailControl?.setValue('');

      expect(component.isFieldInvalid('email')).toBe(false);
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should emit createUser for valid create form', () => {
      spyOn(component.createUser, 'emit');

      component.userForm.patchValue({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });

      component.onSubmit();

      expect(component.createUser.emit).toHaveBeenCalledWith({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should emit updateUser for valid edit form with changes', () => {
      spyOn(component.updateUser, 'emit');

      component.user = mockUser;
      component.ngOnInit();

      component.userForm.patchValue({
        firstName: 'Jane',
        lastName: 'Smith',
      });

      component.onSubmit();

      expect(component.updateUser.emit).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Smith',
      });
    });

    it('should not emit for invalid form', () => {
      spyOn(component.createUser, 'emit');
      spyOn(component.updateUser, 'emit');

      component.userForm.patchValue({
        email: 'invalid-email',
        firstName: '',
        lastName: '',
      });

      component.onSubmit();

      expect(component.createUser.emit).not.toHaveBeenCalled();
      expect(component.updateUser.emit).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched for invalid form', () => {
      component.userForm.patchValue({
        email: '',
        firstName: '',
        lastName: '',
      });

      component.onSubmit();

      expect(component.userForm.get('email')?.touched).toBe(true);
      expect(component.userForm.get('firstName')?.touched).toBe(true);
      expect(component.userForm.get('lastName')?.touched).toBe(true);
    });
  });

  describe('Form Cancellation', () => {
    it('should emit formCancel when cancelled', () => {
      spyOn(component.formCancel, 'emit');

      component.onCancel();

      expect(component.formCancel.emit).toHaveBeenCalled();
    });
  });

  describe('Form Reset', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should reset form values and errors', () => {
      component.userForm.patchValue({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });

      component.userForm.get('email')?.setErrors({ required: true });

      component.resetForm();

      expect(component.userForm.get('email')?.value).toBeNull();
      expect(component.userForm.get('firstName')?.value).toBeNull();
      expect(component.userForm.get('lastName')?.value).toBeNull();
      expect(component.userForm.get('email')?.errors).toBeNull();
    });
  });
});
