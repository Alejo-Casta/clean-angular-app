import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

/**
 * Shared Input Component
 * Wraps PrimeNG InputText with form control integration
 */
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, InputTextModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="input-wrapper">
      <label *ngIf="label" [for]="inputId" class="input-label">
        {{ label }}
        <span *ngIf="required" class="required-indicator">*</span>
      </label>
      
      <input
        pInputText
        [id]="inputId"
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [readonly]="readonly"
        [value]="value"
        [class]="'w-full ' + (invalid ? 'ng-invalid ng-dirty' : '')"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
      />
      
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
      .input-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .input-label {
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

      :host ::ng-deep .p-inputtext {
        width: 100%;
      }

      :host ::ng-deep .p-inputtext.ng-invalid.ng-dirty {
        border-color: var(--red-500);
      }
    `,
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() type: string = 'text';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() invalid = false;
  @Input() errorMessage?: string;
  @Input() helpText?: string;
  @Input() inputId?: string;

  @Output() inputChange = new EventEmitter<string>();
  @Output() inputBlur = new EventEmitter<void>();
  @Output() inputFocus = new EventEmitter<void>();

  value = '';
  
  private onChange = (value: string) => {};
  private onTouched = () => {};

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
    this.inputBlur.emit();
  }

  onFocus(): void {
    this.inputFocus.emit();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
