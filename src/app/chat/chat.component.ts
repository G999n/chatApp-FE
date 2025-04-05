import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  username: string = '';
  message: string = '';
  typingUsers: string[] = [];

  constructor(public chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.startConnection();

    this.chatService.typingUpdate.subscribe((set: Set<string>) => {
      this.typingUsers = Array.from(set);
    });
  }

  send(): void {
    if (this.username && this.message) {
      this.chatService.sendMessage(this.username, this.message);
      this.message = '';
    }
  }

  onTyping(): void {
    if (this.username) {
      this.chatService.notifyTyping(this.username);
    }
  }
}
