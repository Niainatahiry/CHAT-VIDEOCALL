import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { LayoutComponent } from './layout/layout.component';

@Component({
  standalone: true,
  selector: 'app-root',
  template:'<router-outlet></router-outlet>',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, RouterOutlet],
})

export class AppComponent {
  title = 'frontend';
}

