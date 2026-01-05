import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameMessage, MessageType } from '../types/game.types';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  // For win/loss banner messages
  private bannerMessageSubject = new BehaviorSubject<GameMessage | null>(null);
  public bannerMessage$ = this.bannerMessageSubject.asObservable();

  constructor(private snackBar: MatSnackBar) {}

  // Show banner message (only for wins/losses)
  showBannerMessage(text: string, type: 'success' | 'error', duration = 0): void {
    const message: GameMessage = { text, type, duration };
    this.bannerMessageSubject.next(message);

    if (duration > 0) {
      timer(duration).subscribe(() => {
        this.clearBannerMessage();
      });
    }
  }

  clearBannerMessage(): void {
    this.bannerMessageSubject.next(null);
  }

  // Show toaster message (for warnings, info, general errors)
  showToaster(text: string, type: MessageType = 'info', duration = 3000): void {
    let action = 'Dismiss';
    let panelClass = '';

    switch (type) {
      case 'success':
        panelClass = 'success-snackbar';
        break;
      case 'error':
        panelClass = 'error-snackbar';
        action = 'Close';
        break;
      case 'warning':
        panelClass = 'warning-snackbar';
        action = 'OK';
        break;
      case 'info':
      default:
        panelClass = 'info-snackbar';
        break;
    }

    this.snackBar.open(text, action, {
      duration: duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  // Public methods for different message types
  showSuccess(text: string, duration?: number): void {
    this.showBannerMessage(text, 'success', duration);
  }

  showError(text: string, duration?: number): void {
    this.showBannerMessage(text, 'error', duration);
  }

  showWarning(text: string, duration = 4000): void {
    this.showToaster(text, 'warning', duration);
  }

  showInfo(text: string, duration = 3000): void {
    this.showToaster(text, 'info', duration);
  }

  showLoss(text: string, duration?: number): void {
    this.showBannerMessage(text, 'error', duration);
  }

  showVictory(text: string, duration?: number): void {
    this.showBannerMessage(text, 'success', duration);
  }

  // Legacy support - redirects to appropriate method
  showMessage(text: string, type: MessageType = 'info', duration = 3000): void {
    if (type === 'success' || type === 'error') {
      this.showBannerMessage(text, type, duration);
    } else {
      this.showToaster(text, type, duration);
    }
  }

  clearMessage(): void {
    this.clearBannerMessage();
  }
}
