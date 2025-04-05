import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  user: string;
  message: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
    private hubConnection!: signalR.HubConnection;

    public messages: ChatMessage[] = [];
    public typingUsers: Set<string> = new Set();
    public typingUpdate: BehaviorSubject<Set<string>> = new BehaviorSubject(this.typingUsers);
  
    private typingTimeout: any;
  
    constructor() {}
  
    startConnection(): void {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.apiUrl}/chathub`) // Adjust port as needed
        .withAutomaticReconnect()
        .build();

      this.hubConnection
        .start()
        .then(() => console.log('SignalR Connected'))
        .catch(err => console.error('Error starting connection: ', err));
  
      this.hubConnection.on('ReceiveMessage', (message: ChatMessage) => {
        this.messages.push(message);
      });
  
      this.hubConnection.on('UserTyping', (user: string) => {
        this.typingUsers.add(user);
        this.typingUpdate.next(new Set(this.typingUsers));
      });
  
      this.hubConnection.on('UserStoppedTyping', (user: string) => {
        this.typingUsers.delete(user);
        this.typingUpdate.next(new Set(this.typingUsers));
      });
    }
  
    sendMessage(user: string, message: string): void {
      const chatMessage: ChatMessage = {
        user,
        message,
        timestamp: new Date().toISOString()
      };
      this.hubConnection.invoke('SendMessage', chatMessage).catch(err => console.error(err));
    }
  
    notifyTyping(user: string): void {
      this.hubConnection.invoke('SendTypingNotification', user).catch(err => console.error(err));
  
      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => {
        this.hubConnection.invoke('StopTypingNotification', user).catch(err => console.error(err));
      }, 2000); // Stop typing after 2s
    }
}
