import { Component } from '@angular/core';
import { ShiftScheduleComponent } from './shift-schedule.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet],
})
export class AppComponent {
  title = 'Shift Schedule App';
}
