import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import axios from 'axios';
import { StreamChat, Channel, Event } from 'stream-chat';

@Component({
  selector: 'app-friendrequests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './friendrequests.component.html',
  styleUrls: ['./friendrequests.component.css']
})
export class FriendrequestsComponent implements OnInit, OnDestroy {
  requests: any[] = [];
  currentUserId = localStorage.getItem('userId') ?? '';
  chatClient!: StreamChat;
  channel!: Channel;

  async ngOnInit() {
    await this.loadRequests();
    await this.initStreamChat();
  }

  async loadRequests() {
    try {
      const res = await axios.get(`http://localhost:3000/api/friendrequest/requests/${this.currentUserId}`);
      this.requests = res.data;
    } catch (err) {
      console.error('Erreur chargement des invitations', err);
    }
  }

  async respond(fromUserId: string, action: 'accept' | 'reject') {
    try {
      await axios.post(`http://localhost:3000/api/friendrequest/respond/${fromUserId}`, {
        userId: this.currentUserId,
        action,
      });
      await this.loadRequests();
    } catch (err) {
      console.error(`Erreur lors de la réponse à la demande (${action})`, err);
    }
  }

  async initStreamChat() {
    const apiKey = 'ysck6xfhyccd'; // Remplace par ta vraie clé API
    const streamToken = localStorage.getItem('streamToken');
    if (!streamToken || !this.currentUserId) return;

    this.chatClient = StreamChat.getInstance(apiKey);

    try {
      await this.chatClient.connectUser(
        {
          id: this.currentUserId,
          name: `User ${this.currentUserId}`,
        },
        streamToken
      );
    } catch (e) {
      console.error('Échec de connexion à Stream Chat', e);
      return;
    }

    // Watch un canal pour pouvoir interagir si besoin (pas strictement obligatoire pour écouter)
    this.channel = this.chatClient.channel('messaging', `friendrequests_${this.currentUserId}`, {
      members: [this.currentUserId],
    });

    await this.channel.watch();

    // ✅ Écoute globale des nouveaux messages dans tous les canaux
    this.chatClient.on('message.new', async (event: Event) => {
      console.log('Nouveau message reçu (tous canaux confondus)', event);
      await this.loadRequests();
    });
  }

  async ngOnDestroy() {
    if (this.chatClient) {
      await this.chatClient.disconnectUser();
    }
  }
}
