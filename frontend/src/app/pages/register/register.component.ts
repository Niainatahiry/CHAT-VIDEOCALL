import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  password = '';

  constructor(private router: Router) {}

  async register() {
    if (!this.username || !this.password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      // Étape 1 : Création de compte (seulement username et password)
      await axios.post('http://localhost:3000/api/user/register', {
        username: this.username,
        password: this.password
      });

      // Étape 2 : Connexion automatique (seulement username et password)
      const loginResponse = await axios.post('http://localhost:3000/api/user/token', {
        username: this.username,
        password: this.password
      });

      const token = loginResponse.data.token;
      const userId = loginResponse.data.userId; // userId renvoyé par le serveur
      localStorage.setItem('stream_token', token);
      localStorage.setItem('stream_user_id', userId); // stocker userId interne ici

      // Étape 3 : Redirection
      this.router.navigate(['/']);

    } catch (error: any) {
      if (error.response?.status === 409) {
        alert('Nom d’utilisateur déjà utilisé');
      } else {
        alert('Erreur lors de l’inscription ou de la connexion');
        console.error('Erreur Axios:', error);
      }
    }
  }


}
