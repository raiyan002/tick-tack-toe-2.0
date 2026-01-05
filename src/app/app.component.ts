import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

// Services
import { GameService } from './services/game.service';
import { MessageService } from './services/message.service';

// Components
import { GameBoardComponent } from './components/game-board/game-board.component';
import { GameRulesComponent } from './components/game-rules/game-rules.component';
import { GameStatusComponent } from './components/game-status/game-status.component';
import { MessageBannerComponent } from './components/message-banner/message-banner.component';
import { PlayerSetupComponent } from './components/player-setup/player-setup.component';

// Types
import { GameState, GameMode, AIDifficulty } from './types/game.types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    GameBoardComponent,
    GameRulesComponent,
    GameStatusComponent,
    MessageBannerComponent,
    PlayerSetupComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Tick-Tac-Toe 2.0';
  private gameSubscription?: Subscription;
  gameState: GameState | null = null;

  constructor(
    private gameService: GameService,
    private messageService: MessageService
  ) {
    console.log('AppComponent initialized');
  }



  ngOnInit() {
    console.log('AppComponent ngOnInit called');
    this.gameSubscription = this.gameService.gameState$.subscribe(state => {
      this.gameState = state;
    });
  }

  ngOnDestroy() {
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }
  }

  onGameStarted(gameSetup: {gameMode: GameMode, player1: string, player2?: string, aiDifficulty?: AIDifficulty}) {
    // The player setup component now handles game initialization internally
    // This method is kept for potential future use or additional logic
    console.log('Game started with setup:', gameSetup);
  }

  onGameReset() {
    // The player setup component now handles game reset internally
    // This method is kept for potential future use or additional logic
    console.log('Game reset triggered');
  }
}
