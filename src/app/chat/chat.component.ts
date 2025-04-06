import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  AfterViewInit,
  DoCheck,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class ChatComponent implements OnInit, AfterViewInit, DoCheck {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  username = '';
  message = '';
  typingUsers: string[] = [];

  private userIsAtBottom = true;
  private lastMessageSentByMe = false;
  private previousMessageCount = 0;
  showNewMessageNotification = false;
  showNameWarning = false;

  constructor(public chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.startConnection();
    this.chatService.typingUpdate.subscribe((users) => {
      this.typingUsers = Array.from(users);
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom(true);
    this.previousMessageCount = this.chatService.messages.length;
  }

  ngDoCheck(): void {
    const currentCount = this.chatService.messages.length;

    if (currentCount > this.previousMessageCount) {
      if (this.lastMessageSentByMe || this.userIsAtBottom) {
        this.scrollToBottom(true);
        this.lastMessageSentByMe = false;
      } else {
        this.showNewMessageNotification = true;
      }
      this.previousMessageCount = currentCount;
    }
  }

  send(textAreaRef?: HTMLTextAreaElement): void {
    const trimmed = this.message.trim();
  
    if (!this.username.trim()) {
      this.showNameWarning = true;
  
      // Hide the warning automatically after 3 seconds
      setTimeout(() => {
        this.showNameWarning = false;
      }, 3000);
      
      return;
    }
  
    if (trimmed) {
      this.chatService.sendMessage(this.username, trimmed);
      this.message = '';
      this.lastMessageSentByMe = true;
      this.showNewMessageNotification = false;
  
      if (textAreaRef) {
        setTimeout(() => (textAreaRef.style.height = 'auto'), 0);
      }
    }
  }
  
  

  onTyping(): void {
    if (this.username) {
      this.chatService.notifyTyping(this.username);
    }
  }

  scrollToBottom(force = false): void {
    setTimeout(() => {
      const container = this.messagesContainer.nativeElement;
      if (force || this.userIsAtBottom) {
        container.scrollTop = container.scrollHeight;
        this.showNewMessageNotification = false;
      }
    }, 0);
  }

  checkScrollPosition(): void {
    const container = this.messagesContainer.nativeElement;
    const nearBottom =
      container.scrollHeight - container.scrollTop <= container.clientHeight + 10;
    this.userIsAtBottom = nearBottom;

    if (nearBottom) {
      this.showNewMessageNotification = false;
    }
  }

  handleKeyDown(event: KeyboardEvent, textAreaRef: HTMLTextAreaElement): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send(textAreaRef);
    }
  }

  autoResize(textArea: HTMLTextAreaElement): void {
    textArea.style.height = 'auto';
    textArea.style.height =
      Math.min(textArea.scrollHeight, 200) + 'px';
  }
}