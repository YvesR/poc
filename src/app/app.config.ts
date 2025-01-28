import { provideRouter, RouterModule } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ShiftScheduleComponent } from './shift-schedule.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

const routes = [
  { path: '', component: ShiftScheduleComponent },
];

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)],
});

export const appConfig = {
  providers: [
    provideRouter(routes), provideAnimationsAsync(),
  ],
};