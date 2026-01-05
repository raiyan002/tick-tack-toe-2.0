import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game.service';
import { AIService } from '../../services/ai.service';
import { MessageService } from '../../services/message.service';
import { GameState, GameMode, AIDifficulty } from '../../types/game.types';

@Component({
  selector: 'app-player-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatDividerModule,
    MatChipsModule,
    MatDialogModule
  ],
  template: `
    <mat-card class="player-setup-card">
      <mat-card-content>
        <form [formGroup]="setupForm" class="setup-form">

          <!-- Game Mode Selection -->
          <div class="mode-selection">
            <h3 class="section-title">
              <mat-icon>videogame_asset</mat-icon>
              Choose Game Mode
            </h3>
            <p class="section-description">Select how you want to play your game</p>
            <mat-button-toggle-group formControlName="gameMode" class="mode-toggle-group">
              <mat-button-toggle value="multiplayer" class="mode-toggle multiplayer"
                                 (click)="onGameModeChange('multiplayer')">
                <mat-icon>group</mat-icon>
                <span>vs Friend</span>
              </mat-button-toggle>
              <mat-button-toggle value="single-player" class="mode-toggle single-player"
                                 (click)="onGameModeChange('single-player')">
                <mat-icon>smart_toy</mat-icon>
                <span>vs AI</span>
              </mat-button-toggle>
            </mat-button-toggle-group>
          </div>

          <!-- Player Setup -->
          <div class="players-section">
            <h3 class="section-title">
              <mat-icon>account_circle</mat-icon>
              Player Setup
            </h3>

            <div class="form-row">
              <!-- Player 1 -->
              <mat-form-field appearance="outline" class="player-field">
                <mat-label>Player 1</mat-label>
                <input matInput formControlName="player1" placeholder="Enter your name">
                <mat-icon matSuffix color="primary">close</mat-icon>
                <mat-error *ngIf="setupForm.get('player1')?.hasError('required')">
                  Player name is required
                </mat-error>
              </mat-form-field>

              <div class="vs-divider">
                <mat-icon>sports_kabaddi</mat-icon>
              </div>

              <!-- Player 2 / AI Display -->
              <div class="player2-container">
                <mat-form-field appearance="outline" class="player-field"
                               *ngIf="setupForm.get('gameMode')?.value === 'multiplayer'">
                  <mat-label>Player 2</mat-label>
                  <input matInput formControlName="player2" placeholder="Enter name">
                  <mat-icon matSuffix color="accent">radio_button_unchecked</mat-icon>
                  <mat-error *ngIf="setupForm.get('player2')?.hasError('required')">
                    Player 2 name is required
                  </mat-error>
                </mat-form-field>

                <div class="ai-player-display" *ngIf="setupForm.get('gameMode')?.value === 'single-player'">
                  <button mat-stroked-button class="ai-player-button" disabled>
                    <div class="ai-player-content">
                      <div class="ai-info">
                        <span class="ai-name">{{ getAIPlayerName() }}</span>
                      </div>
                      <mat-icon class="ai-icon">radio_button_unchecked</mat-icon>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="button-container">
            <button mat-raised-button color="primary"
                    *ngIf="gameState?.gameStatus === 'not-started'"
                    (click)="startGame()"
                    [disabled]="!isFormValid()"
                    class="game-button start-button">
              <mat-icon>play_arrow</mat-icon>
              Start Game
            </button>

            <button mat-raised-button color="warn"
                    *ngIf="gameState?.gameStatus === 'in-progress' || gameState?.gameStatus === 'finished'"
                    (click)="restartGame()"
                    class="game-button restart-button">
              <mat-icon>restart_alt</mat-icon>
              Restart Game
            </button>
          </div>
        </form>

        <!-- AI Difficulty Popup -->
        <div class="difficulty-overlay" *ngIf="showDifficultyPopup">
          <div class="difficulty-popup">
            <h3 class="popup-title">
              <mat-icon>psychology</mat-icon>
              Choose AI Difficulty
            </h3>
            <div class="difficulty-options">
              <button mat-raised-button
                      class="difficulty-btn easy-btn"
                      (click)="selectDifficulty('easy')">
                <mat-icon>sentiment_very_satisfied</mat-icon>
                Easy
              </button>
              <button mat-raised-button
                      class="difficulty-btn medium-btn"
                      (click)="selectDifficulty('medium')">
                <mat-icon>engineering</mat-icon>
                Medium
              </button>
              <button mat-raised-button
                      class="difficulty-btn hard-btn"
                      (click)="selectDifficulty('hard')">
                <mat-icon>whatshot</mat-icon>
                Hard
              </button>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styleUrls: ['./player-setup.component.css']
})
export class PlayerSetupComponent implements OnInit, OnDestroy {
  @Output() gameStarted = new EventEmitter<{gameMode: GameMode, player1: string, player2?: string, aiDifficulty?: AIDifficulty}>();
  @Output() gameReset = new EventEmitter<void>();

  setupForm!: FormGroup;
  gameState: GameState | null = null;
  showDifficultyPopup = false;
  private difficultySelected = false;
  private isHandlingModeChange = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    private gameService: GameService,
    private aiService: AIService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToGameState();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initializeForm(): void {
    this.setupForm = this.formBuilder.group({
      gameMode: ['multiplayer', [Validators.required]],
      aiDifficulty: ['medium'],
      player1: ['', [Validators.required]],
      player2: ['']
    });

    // Watch for game mode changes to update player2 validation (only for programmatic changes)
    this.setupForm.get('gameMode')?.valueChanges.subscribe(mode => {
      // Only handle if not already being handled by explicit click
      if (!this.isHandlingModeChange) {
        const player2Control = this.setupForm.get('player2');
        if (mode === 'multiplayer') {
          player2Control?.setValidators([Validators.required]);
          this.showDifficultyPopup = false;
        } else {
          player2Control?.clearValidators();
          // Show popup for AI mode if not already selected
          if (!this.difficultySelected) {
            this.showDifficultyPopup = true;
          }
        }
        player2Control?.updateValueAndValidity();
      }
    });
  }

  private subscribeToGameState(): void {
    this.subscription = this.gameService.gameState$.subscribe(state => {
      this.gameState = state;
      this.updateFormState(state);
    });
  }

  private updateFormState(state: GameState): void {
    if (state.gameStatus === 'in-progress') {
      // Keep game mode always enabled, only disable other fields
      this.setupForm.get('aiDifficulty')?.disable();
      this.setupForm.get('player1')?.disable();
      this.setupForm.get('player2')?.disable();
      this.showDifficultyPopup = false; // Close popup when game starts
    } else {
      this.setupForm.get('gameMode')?.enable();
      this.setupForm.get('aiDifficulty')?.enable();
      this.setupForm.get('player1')?.enable();
      this.setupForm.get('player2')?.enable();
      if (state.gameStatus === 'not-started') {
        // Don't reset player names - keep them for convenience
        // Only reset difficulty selection status when game is reset
        this.difficultySelected = false;
      }
    }
  }

  isFormValid(): boolean {
    const gameMode = this.setupForm.get('gameMode')?.value;
    const player1 = this.setupForm.get('player1')?.value;
    const player2 = this.setupForm.get('player2')?.value;
    const aiDifficulty = this.setupForm.get('aiDifficulty')?.value;

    if (!gameMode || !player1) return false;

    if (gameMode === 'multiplayer') {
      return !!player2;
    } else {
      return !!aiDifficulty;
    }
  }

  selectDifficulty(difficulty: AIDifficulty): void {
    this.setupForm.patchValue({ aiDifficulty: difficulty });
    this.showDifficultyPopup = false;
    this.difficultySelected = true; // Mark that user has selected a difficulty
  }

  getAIPlayerName(): string {
    const difficulty = this.setupForm.get('aiDifficulty')?.value;
    return this.aiService.getAIPlayerName(difficulty || 'medium');
  }

  startGame(): void {
    if (!this.isFormValid()) {
      this.messageService.showWarning('Please complete all required fields!');
      return;
    }

    const gameMode = this.setupForm.get('gameMode')?.value as GameMode;
    const player1Name = this.setupForm.get('player1')?.value;

    if (gameMode === 'multiplayer') {
      const player2Name = this.setupForm.get('player2')?.value;
      this.gameService.initializeMultiplayerGame(player1Name, player2Name);
      this.messageService.showSuccess(`Game started! ${player1Name} vs ${player2Name}`);
      this.gameStarted.emit({gameMode, player1: player1Name, player2: player2Name});
    } else {
      const aiDifficulty = this.setupForm.get('aiDifficulty')?.value as AIDifficulty;
      this.gameService.initializeSinglePlayerGame(player1Name, aiDifficulty);
      const aiName = this.aiService.getAIPlayerName(aiDifficulty);
      this.messageService.showSuccess(`Game started! ${player1Name} vs ${aiName}`);
      this.gameStarted.emit({gameMode, player1: player1Name, aiDifficulty});
    }
  }

  restartGame(): void {
    this.gameService.resetGame();

    // Automatically start a new game if the form is valid
    if (this.isFormValid()) {
      // Small delay to allow reset to complete
      setTimeout(() => {
        this.startGame();
      }, 100);
    } else {
      this.messageService.showInfo('Game restarted! Ready for another round.');
      this.gameReset.emit();
    }
  }

  resetGame(): void {
    this.gameService.resetGame();
    this.messageService.showInfo('Game reset! Choose your settings to start.');
    this.gameReset.emit();
  }

  onGameModeChange(mode: GameMode): void {
    // Prevent circular calls by temporarily disabling valueChanges subscription
    this.isHandlingModeChange = true;

    // Reset the game first
    this.gameService.resetGame();

    // Update form without triggering valueChanges
    this.setupForm.patchValue({
      gameMode: mode,
      aiDifficulty: 'medium'
    }, { emitEvent: false });

    // Handle mode-specific logic
    const player2Control = this.setupForm.get('player2');
    if (mode === 'multiplayer') {
      player2Control?.setValidators([Validators.required]);
      this.showDifficultyPopup = false;
      this.difficultySelected = false;
    } else {
      player2Control?.clearValidators();
      // Always show popup when vs AI is selected
      this.showDifficultyPopup = true;
      this.difficultySelected = false;
    }
    player2Control?.updateValueAndValidity();

    // Re-enable valueChanges subscription
    setTimeout(() => {
      this.isHandlingModeChange = false;
    }, 0);
  }
}
