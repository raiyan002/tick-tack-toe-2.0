import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription, timer } from 'rxjs';
import { GameService } from '../../services/game.service';
import { MessageService } from '../../services/message.service';
import { GameState } from '../../types/game.types';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="game-board-container">
      <mat-card class="board-card">
        <mat-card-content>
          <!-- AI Thinking Indicator -->
          <div class="ai-thinking" *ngIf="isAITurn()">
            <mat-icon class="thinking-icon">psychology</mat-icon>
            <span>{{ getCurrentPlayerName() }} is thinking...</span>
          </div>

          <div class="game-board" [class.ai-turn]="isAITurn()">
            <div class="board-row" *ngFor="let row of gameState?.gameMatrix; let i = index">
              <div class="board-cell"
                   *ngFor="let cell of row; let j = index"
                   (click)="makeMove(i, j)"
                   [class]="getCellAnimationClass(i, j)"
                   [class.disabled]="isAITurn()"
                   [matTooltip]="getCellTooltip(i, j)"
                   matTooltipPosition="above">

                <div class="cell-content" *ngIf="cell !== ''">
                  <mat-icon class="piece-icon"
                           [class.x-piece]="cell === 'X'"
                           [class.o-piece]="cell === 'O'"
                           [class.faded]="isToBeRemoved(i, j)">
                    {{ cell === 'X' ? 'close' : 'radio_button_unchecked' }}
                  </mat-icon>
                </div>

                <div class="cell-overlay" *ngIf="cell === '' && gameState?.gameStatus === 'in-progress' && !isAITurn()">
                  <mat-icon class="hover-icon">add</mat-icon>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./game-board.component.css']
})
export class GameBoardComponent implements OnInit, OnDestroy {
  gameState: GameState | null = null;
  animatingCells: { [key: string]: boolean } = {};
  private subscription: Subscription = new Subscription();

  constructor(
    private gameService: GameService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.subscription = this.gameService.gameState$.subscribe(
      state => this.gameState = state
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  makeMove(row: number, column: number): void {
    if (!this.gameState) return;

    // Check if cell is already occupied
    if (this.gameState.gameMatrix[row][column] !== '') {
      this.messageService.showWarning('This cell is already occupied!');
      return;
    }

    // Check if game is not in progress
    if (this.gameState.gameStatus !== 'in-progress') {
      if (this.gameState.gameStatus === 'not-started') {
        this.messageService.showWarning('Please start the game first!');
      } else {
        this.messageService.showInfo('Game is finished! Click Reset to play again.');
      }
      return;
    }

    // Check if it's AI's turn - prevent human from making moves
    const currentPlayer = this.gameState.currentPlayerIcon === 'X' ? this.gameState.player1 : this.gameState.player2;
    if (currentPlayer.type === 'ai') {
      this.messageService.showInfo(`Wait for ${currentPlayer.name} to make a move...`);
      return;
    }

    // Animate piece removal if needed
    if (currentPlayer.movesArray.items.length === 3) {
      const oldestMove = currentPlayer.movesArray.peekFirst();
      if (oldestMove) {
        this.animateCell(oldestMove.row, oldestMove.column, 'removing');
      }
    }

    // Make the move
    const result = this.gameService.makeMove(row, column);

    if (result.success && result.message) {
      // Get updated game state to check if game is finished
      const updatedState = this.gameService.currentGameState;
      if (updatedState.gameStatus === 'finished') {
        // Determine message type based on game outcome
        if (updatedState.gameMode === 'single-player') {
          // Check if message indicates human loss (contains words like "lost", "defeated", "embarrassing", etc.)
          const isLossMessage = /lost|defeated|embarrassing|outplayed|destroyed|schooled|fell|outmatched/i.test(result.message);
          if (isLossMessage) {
            this.messageService.showError(result.message, 0); // Show loss as error message
          } else {
            this.messageService.showSuccess(result.message, 0); // Show win as success message
          }
        } else {
          // Multiplayer mode - always show as success
          this.messageService.showSuccess(result.message, 0);
        }
      } else {
        this.messageService.showInfo(result.message, 2000);
      }
    } else if (!result.success && result.message) {
      this.messageService.showWarning(result.message);
    }
  }

  isToBeRemoved(row: number, column: number): boolean {
    return this.gameService.isToBeRemoved(row, column);
  }

  isWinningCell(row: number, column: number): boolean {
    return this.gameService.isWinningCell(row, column);
  }

  isAITurn(): boolean {
    if (!this.gameState || this.gameState.gameStatus !== 'in-progress') {
      return false;
    }
    const currentPlayer = this.gameState.currentPlayerIcon === 'X' ?
      this.gameState.player1 : this.gameState.player2;
    return currentPlayer.type === 'ai';
  }

  getCurrentPlayerName(): string {
    if (!this.gameState) return '';
    const currentPlayer = this.gameState.currentPlayerIcon === 'X' ?
      this.gameState.player1 : this.gameState.player2;
    return currentPlayer.name;
  }

  getCellAnimationClass(row: number, column: number): string {
    const cellKey = `${row}-${column}`;

    if (this.animatingCells[cellKey]) {
      return 'cell-removing';
    }

    if (this.isWinningCell(row, column)) {
      return 'cell-winner';
    }

    if (this.isToBeRemoved(row, column)) {
      return 'cell-to-remove';
    }

    return '';
  }

  getCellTooltip(row: number, column: number): string {
    if (this.isToBeRemoved(row, column)) {
      return 'This piece will be removed on next turn';
    }

    if (this.gameState?.gameMatrix[row][column] === '' && this.gameState?.gameStatus === 'in-progress') {
      return 'Click to place your piece';
    }

    return '';
  }

  private animateCell(row: number, column: number, animationType: string): void {
    const cellKey = `${row}-${column}`;
    this.animatingCells[cellKey] = true;

    timer(300).subscribe(() => {
      this.animatingCells[cellKey] = false;
    });
  }
}
