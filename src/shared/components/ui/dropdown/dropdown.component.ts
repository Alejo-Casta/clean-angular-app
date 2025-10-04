import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

export interface DropdownOption {
  label: string;
  value: any;
  disabled?: boolean;
}

/**
 * Shared Dropdown Component
 * Wraps PrimeNG Dropdown with form control integration
 */
@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true,
    },
  ],
  template: `
    <div class="dropdown-wrapper">
      <label *ngIf="label" [for]="dropdownId" class="dropdown-label">
        {{ label }}
        <span *ngIf="required" class="required-indicator">*</span>
      </label>

      <select
        [id]="dropdownId"
        [disabled]="disabled"
        [ngModel]="value"
        [class]="
          'form-control w-full ' + (invalid ? 'ng-invalid ng-dirty' : '')
        "
        (change)="onSelectionChange($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
      >
        <option value="" [disabled]="required">
          {{ placeholder || 'Select an option' }}
        </option>
        <option
          *ngFor="let option of options"
          [value]="option.value"
          [disabled]="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>

      <div *ngIf="invalid && errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div *ngIf="helpText && !invalid" class="help-text">
        {{ helpText }}
      </div>
    </div>
  `,
  styles: [
    `
      .dropdown-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .dropdown-label {
        font-weight: 500;
        color: var(--text-color);
        font-size: 0.875rem;
      }

      .required-indicator {
        color: var(--red-500);
      }

      .error-message {
        color: var(--red-500);
        font-size: 0.75rem;
        margin-top: 0.25rem;
      }

      .help-text {
        color: var(--text-color-secondary);
        font-size: 0.75rem;
        margin-top: 0.25rem;
      }

      :host ::ng-deep .p-dropdown {
        width: 100%;
      }

      :host ::ng-deep .p-dropdown.ng-invalid.ng-dirty {
        border-color: var(--red-500);
      }
    `,
  ],
})
export class DropdownComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() options: DropdownOption[] = [];
  @Input() disabled = false;
  @Input() required = false;
  @Input() invalid = false;
  @Input() errorMessage?: string;
  @Input() helpText?: string;
  @Input() dropdownId?: string;
  @Input() filter = false;
  @Input() filterBy = 'label';
  @Input() showClear = false;
  @Input() emptyMessage = 'No results found';
  @Input() emptyFilterMessage = 'No results found';

  @Output() selectionChange = new EventEmitter<any>();
  @Output() dropdownBlur = new EventEmitter<void>();
  @Output() dropdownFocus = new EventEmitter<void>();

  value: any = null;

  private onChange = (value: any) => {};
  private onTouched = () => {};

  onSelectionChange(event: any): void {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChange(this.value);
    this.selectionChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
    this.dropdownBlur.emit();
  }

  onFocus(): void {
    this.dropdownFocus.emit();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
