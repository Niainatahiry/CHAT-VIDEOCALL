import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  friends: any[] = [];
  currentUserId = localStorage.getItem('userId') ?? '';

  constructor(public router: Router) {}


  isActive(friendId: string): boolean {
    return this.router.url === `/chat/${friendId}`;
  }
  ngOnInit() {
    this.loadFriends();
  }

  async loadFriends() {
    if (!this.currentUserId) {
      console.warn('UserId introuvable');
      return;
    }

    try {
      const res = await axios.get(`http://localhost:3000/api/friend/friends/${this.currentUserId}`);
      this.friends = res.data;
      console.log('Liste des amis:', this.friends);
    } catch (err) {
      console.error('Erreur lors du chargement des amis', err);
    }
  }

  logout() {
    // Supprime les données de session
    localStorage.removeItem('streamToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');

    // Redirige vers la page login
    this.router.navigate(['/login']);
  }
}
