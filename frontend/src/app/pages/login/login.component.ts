import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule, RouterLink],
})
export class LoginComponent {
  userId = '';
  password = '';

  constructor(private router: Router) {}

  async login() {
    if (!this.userId || !this.password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/user/token', {
        username: this.userId,
        password: this.password,
      });

      const { token, userId, username } = response.data;

      // Stocke les données (localStorage ou service)
      localStorage.setItem('streamToken', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', username);

      alert('Connexion réussie');

      // Redirige vers la page principale
      this.router.navigate(['/']); // adapte selon ta route
    } catch (error) {
      console.error('Erreur de connexion:', error);
      alert('Identifiants invalides');
    }
  }
}
