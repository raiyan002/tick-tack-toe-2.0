import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game.service';
import { GameState } from '../../types/game.types';

@Component({
  selector: 'app-game-status',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <!-- Game Status -->
    <div class="game-status" *ngIf="gameState?.gameStatus === 'in-progress'">
      <mat-card class="status-card">
        <mat-card-content>
          <div class="current-turn">
            <div class="player-indicator" [class.active]="gameState?.currentPlayerIcon === 'X'">
              <mat-icon class="player-icon x-icon">close</mat-icon>
              <span class="player-name">{{ gameState?.player1?.name || 'Player 1' }}</span>
              <div class="turn-indicator" *ngIf="gameState?.currentPlayerIcon === 'X'">Your Turn</div>
            </div>

            <div class="turn-divider">
              <mat-icon>keyboard_double_arrow_right</mat-icon>
            </div>

            <div class="player-indicator" [class.active]="gameState?.currentPlayerIcon === 'O'">
              <mat-icon class="player-icon o-icon">radio_button_unchecked</mat-icon>
              <span class="player-name">{{ gameState?.player2?.name || 'Player 2' }}</span>
              <div class="turn-indicator" *ngIf="gameState?.currentPlayerIcon === 'O'">Your Turn</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./game-status.component.css']
})
export class GameStatusComponent implements OnInit, OnDestroy {
  gameState: GameState | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.subscription = this.gameService.gameState$.subscribe(
      state => this.gameState = state
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
