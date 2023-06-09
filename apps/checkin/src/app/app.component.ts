import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ManageComponent } from '@angular-architects/checkin/feature-manage';

@Component({
  standalone: true,
  imports: [CommonModule, ManageComponent],
  selector: 'angular-architects-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'checkin';
}
