import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { StreamChat } from 'stream-chat';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  private client: StreamChat;
  private routeSub!: Subscription;
  private channelCleanup!: () => void;

  currentUserId = localStorage.getItem('userId') ?? '';
  friendId = '';
  messages: any[] = [];
  newMessage = '';
  channel: any;

  constructor(private route: ActivatedRoute) {
    this.client = StreamChat.getInstance('ysck6xfhyccd');
  }

  ngOnInit() {
    const token = localStorage.getItem('streamToken');
    if (!this.currentUserId || !token) return;

    this.client.connectUser(
      { id: this.currentUserId, name: this.currentUserId },
      token
    ).then(() => {
      this.routeSub = this.route.paramMap.subscribe(async (params: ParamMap) => {
        const newFriendId = params.get('friendid');
        if (!newFriendId) return;

        this.friendId = newFriendId;
        await this.setupChannel();
      });
    });
  }

  async setupChannel() {
    if (this.channel) {
      this.channel.off('message.new'); // Retirer ancien listener
      await this.channel.stopWatching(); // Arrêter ancien canal
    }

    const channelId = [this.currentUserId, this.friendId].sort().join('-');
    this.channel = this.client.channel('messaging', channelId, {
      members: [this.currentUserId, this.friendId],
    });

    await this.channel.watch();
    this.messages = this.channel.state.messages;

    this.channel.on('message.new', (event: { message: any }) => {
      this.messages.push(event.message);
    });
  }

  async sendMessage() {
    if (this.newMessage.trim()) {
      await this.channel.sendMessage({ text: this.newMessage });
      this.newMessage = '';
    }
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
    this.channel?.stopWatching();
    this.channel?.off('message.new');
  }
}
