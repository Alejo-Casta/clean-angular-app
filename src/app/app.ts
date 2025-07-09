import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationComponent } from '../shared/components/notification.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'Clean Angular App';
}
