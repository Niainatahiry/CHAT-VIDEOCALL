import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import axios from 'axios';

@Component({
  standalone: true,
  selector: 'app-friendrequests',
  templateUrl: './usersearch.component.html',
  styleUrls: ['./usersearch.component.css'],
  imports: [CommonModule, FormsModule],

})
export class UsersearchComponent implements OnInit {
  results: any[] = [];
  userId: string = '';
  searchQuery: string = '';
  loading = false;

  ngOnInit(): void {
    const storedId = localStorage.getItem('userId');
    if (!storedId) {
      alert("Utilisateur non authentifié");
      return;
    }
    this.userId = storedId;
  }

  async searchUsers() {
    if (!this.searchQuery.trim()) {
      this.results = [];
      return;
    }

    this.loading = true;
    try {
      const res = await axios.get('http://localhost:3000/api/user/search', {
        params: {
          q: this.searchQuery,
          exclude: this.userId
        }
      });
      this.results = res.data;
    } catch (err) {
      console.error('Erreur lors de la recherche', err);
    } finally {
      this.loading = false;
    }
  }
  async sendFriendRequest(targetUserId: string) {
    try {
      const res = await axios.post(`http://localhost:3000/api/friendrequest/request/${targetUserId}`, {
        userId: this.userId
      });
      console.log(res.data.message); // Optionnel : retour visuel
    } catch (err) {
      console.error("Erreur lors de l'envoi de la demande d'ami", err);
    }
  }

}
