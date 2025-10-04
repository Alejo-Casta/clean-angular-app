import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';

/**
 * Shared Dialog Component
 * Wraps PrimeNG Dialog with consistent behavior
 */
@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule],
  template: `
    <p-dialog
      [visible]="visible"
      [header]="header"
      [modal]="modal"
      [closable]="closable"
      [draggable]="draggable"
      [resizable]="resizable"
      [style]="{
        width: width,
        height: height,
        minWidth: minWidth,
        minHeight: minHeight,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
      }"
      [position]="position"
      [blockScroll]="blockScroll"
      [closeOnEscape]="closeOnEscape"
      [dismissableMask]="dismissableMask"
      [styleClass]="styleClass"
      (onShow)="onShow.emit()"
      (onHide)="handleHide()"
    >
      <ng-content></ng-content>

      <ng-container *ngIf="footerTemplate">
        <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
      </ng-container>
    </p-dialog>
  `,
})
export class DialogComponent {
  @Input() visible = false;
  @Input() header?: string;
  @Input() modal = true;
  @Input() closable = true;
  @Input() draggable = true;
  @Input() resizable = true;
  @Input() width?: string;
  @Input() height?: string;
  @Input() minWidth?: string;
  @Input() minHeight?: string;
  @Input() maxWidth?: string;
  @Input() maxHeight?: string;
  @Input() position:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'topleft'
    | 'topright'
    | 'bottomleft'
    | 'bottomright' = 'center';
  @Input() blockScroll = true;
  @Input() closeOnEscape = true;
  @Input() dismissableMask = false;
  @Input() styleClass?: string;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onShow = new EventEmitter<void>();
  @Output() onHide = new EventEmitter<void>();

  @ContentChild('footer') footerTemplate?: TemplateRef<any>;

  handleHide(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.onHide.emit();
  }

  show(): void {
    this.visible = true;
    this.visibleChange.emit(this.visible);
  }

  hide(): void {
    this.handleHide();
  }
}
