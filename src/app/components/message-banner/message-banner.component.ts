import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { GameMessage } from '../../types/game.types';

@Component({
  selector: 'app-message-banner',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <!-- Win/Loss Banner Messages Only -->
    <div class="message-banner"
         [class]="'message-' + (currentMessage ? currentMessage.type : 'info')"
         *ngIf="currentMessage && (currentMessage.type === 'success' || currentMessage.type === 'error')">
      <mat-icon class="message-icon">
        {{ getMessageIcon() }}
      </mat-icon>
      <span class="message-text">{{ currentMessage.text }}</span>
    </div>
  `,
  styleUrls: ['./message-banner.component.css']
})
export class MessageBannerComponent implements OnInit, OnDestroy {
  currentMessage: GameMessage | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.subscription = this.messageService.bannerMessage$.subscribe(
      message => this.currentMessage = message
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getMessageIcon(): string {
    switch (this.currentMessage?.type) {
      case 'success': return 'emoji_events'; // Trophy icon for wins
      case 'error': return 'sentiment_very_dissatisfied'; // Sad face for losses
      default: return 'info';
    }
  }

  clearMessage(): void {
    this.messageService.clearBannerMessage();
  }
}
