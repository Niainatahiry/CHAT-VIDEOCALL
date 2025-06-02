import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import axios from 'axios';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  users: any[] = [];

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const response = await axios.get('http://localhost:3000/api/user/users');
      this.users = response.data.users;
      console.log('Utilisateurs Stream:', this.users);
    } catch (error) {
      console.error('Erreur en récupérant les utilisateurs Stream:', error);
    }
  }

}

