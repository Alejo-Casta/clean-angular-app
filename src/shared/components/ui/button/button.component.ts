import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

/**
 * Shared Button Component
 * Wraps PrimeNG Button with consistent styling and behavior
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <p-button
      [label]="label"
      [icon]="icon"
      [iconPos]="iconPos"
      [disabled]="disabled"
      [loading]="loading"
      [severity]="severity"
      [size]="size"
      [outlined]="outlined"
      [text]="text"
      [raised]="raised"
      [rounded]="rounded"
      [class]="styleClass"
      (onClick)="handleClick($event)"
    >
      <ng-content></ng-content>
    </p-button>
  `,
})
export class ButtonComponent {
  @Input() label?: string;
  @Input() icon?: string;
  @Input() iconPos: 'left' | 'right' | 'top' | 'bottom' = 'left';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() severity:
    | 'success'
    | 'info'
    | 'danger'
    | 'help'
    | 'primary'
    | 'secondary'
    | 'contrast'
    | null = null;
  @Input() size: 'small' | 'large' | undefined = undefined;
  @Input() outlined = false;
  @Input() text = false;
  @Input() raised = false;
  @Input() rounded = false;
  @Input() styleClass?: string;

  @Output() click = new EventEmitter<Event>();

  handleClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.click.emit(event);
    }
  }
}
