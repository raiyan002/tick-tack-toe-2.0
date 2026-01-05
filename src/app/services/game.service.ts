import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { GameState, GameStatus, Player, PlayerIcon, Move, Queue, GameMode, AIDifficulty } from '../types/game.types';
import { AIService } from './ai.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private initialGameState: GameState = {
    gameMatrix: Array.from({ length: 3 }, () => Array(3).fill('')),
    currentPlayerIcon: 'X',
    player1: { name: '', icon: 'X', movesArray: new Queue<Move>(3), type: 'human' },
    player2: { name: '', icon: 'O', movesArray: new Queue<Move>(3), type: 'human' },
    gameStatus: 'not-started',
    gameMode: 'multiplayer'
  };

  private gameStateSubject = new BehaviorSubject<GameState>(this.initialGameState);
  public gameState$ = this.gameStateSubject.asObservable();

  constructor(private aiService: AIService) {}

  get currentGameState(): GameState {
    return this.gameStateSubject.value;
  }

  initializeMultiplayerGame(player1Name: string, player2Name: string): void {
    const newState = { ...this.currentGameState };
    newState.player1 = { name: player1Name, icon: 'X', movesArray: new Queue<Move>(3), type: 'human' };
    newState.player2 = { name: player2Name, icon: 'O', movesArray: new Queue<Move>(3), type: 'human' };
    newState.gameMode = 'multiplayer';
    newState.gameStatus = 'in-progress';
    this.updateGameState(newState);
  }

  initializeSinglePlayerGame(playerName: string, aiDifficulty: AIDifficulty): void {
    const newState = { ...this.currentGameState };
    newState.player1 = { name: playerName, icon: 'X', movesArray: new Queue<Move>(3), type: 'human' };
    newState.player2 = {
      name: this.aiService.getAIPlayerName(aiDifficulty),
      icon: 'O',
      movesArray: new Queue<Move>(3),
      type: 'ai',
      aiDifficulty: aiDifficulty
    };
    newState.gameMode = 'single-player';
    newState.gameStatus = 'in-progress';
    this.updateGameState(newState);
  }

  // Legacy method for backward compatibility
  initializeGame(player1Name: string, player2Name: string): void {
    this.initializeMultiplayerGame(player1Name, player2Name);
  }

  makeMove(row: number, column: number): { success: boolean; message?: string } {
    const state = this.currentGameState;

    // Validate move
    if (state.gameMatrix[row][column] !== '') {
      return { success: false, message: 'This cell is already occupied!' };
    }

    if (state.gameStatus !== 'in-progress') {
      return { success: false, message: 'Game is not in progress!' };
    }

    // Check if it's an AI player's turn (prevent human from making AI moves)
    const currentPlayer = state.currentPlayerIcon === 'X' ? state.player1 : state.player2;
    if (currentPlayer.type === 'ai') {
      return { success: false, message: 'Wait for AI to make a move!' };
    }

    const result = this.processMoveInternal(row, column);

    // If move was successful and game is still in progress, check if next player is AI
    if (result.success && this.currentGameState.gameStatus === 'in-progress') {
      const nextPlayer = this.currentGameState.currentPlayerIcon === 'X' ?
        this.currentGameState.player1 : this.currentGameState.player2;

      if (nextPlayer.type === 'ai') {
        // Trigger AI move after a delay
        this.triggerAIMove();
      }
    }

    return result;
  }

  private processMoveInternal(row: number, column: number): { success: boolean; message?: string } {
    const state = this.currentGameState;
    const newState = { ...state };
    const currentPlayer = state.currentPlayerIcon === 'X' ? newState.player1 : newState.player2;
    newState.currentPlayer = currentPlayer;

    // Remove oldest move if player has 3 moves
    if (currentPlayer.movesArray.items.length === 3) {
      const oldestMove = currentPlayer.movesArray.peekFirst();
      if (oldestMove) {
        newState.gameMatrix[oldestMove.row][oldestMove.column] = '';
      }
    }

    // Add new move
    const move: Move = { row, column };
    currentPlayer.movesArray.enqueue(move);
    newState.gameMatrix[row][column] = state.currentPlayerIcon;

    // Check for win
    if (currentPlayer.movesArray.items.length === 3) {
      if (this.checkForWin(currentPlayer)) {
        newState.gameStatus = 'finished';
        this.updateGameState(newState);

        // Custom messages for AI vs Human games
        if (state.gameMode === 'single-player') {
          if (currentPlayer.type === 'ai') {
            // AI wins - show loss message to human
            const humanPlayer = currentPlayer.icon === 'X' ? state.player2 : state.player1;
            const lossMessage = this.getHumanLossMessage(currentPlayer.aiDifficulty!, humanPlayer.name);
            return { success: true, message: lossMessage };
          } else {
            // Human wins against AI
            const aiPlayer = currentPlayer.icon === 'X' ? state.player2 : state.player1;
            const winMessage = this.getHumanWinMessage(aiPlayer.aiDifficulty!, currentPlayer.name);
            return { success: true, message: winMessage };
          }
        } else {
          // Multiplayer mode - standard win message
          return { success: true, message: `🎉 ${currentPlayer.name} wins!` };
        }
      }
    }

    // Switch player
    newState.currentPlayerIcon = state.currentPlayerIcon === 'X' ? 'O' : 'X';
    const nextPlayer = newState.currentPlayerIcon === 'X' ? newState.player1 : newState.player2;

    this.updateGameState(newState);
    return { success: true, message: `${nextPlayer.name}'s turn` };
  }

  private triggerAIMove(): void {
    const state = this.currentGameState;
    const aiPlayer = state.currentPlayerIcon === 'X' ? state.player1 : state.player2;

    if (aiPlayer.type !== 'ai' || !aiPlayer.aiDifficulty) {
      return;
    }

    // Get thinking delay for better UX
    const delay = this.aiService.getAIThinkingDelay(aiPlayer.aiDifficulty);

    timer(delay).subscribe(() => {
      const aiMove = this.aiService.getAIMove(this.currentGameState, aiPlayer);
      if (aiMove) {
        this.processMoveInternal(aiMove.row, aiMove.column);
      }
    });
  }

  resetGame(): void {
    const resetState = {
      gameMatrix: Array.from({ length: 3 }, () => Array(3).fill('')),
      currentPlayerIcon: 'X' as PlayerIcon,
      player1: { name: '', icon: 'X' as PlayerIcon, movesArray: new Queue<Move>(3), type: 'human' as const },
      player2: { name: '', icon: 'O' as PlayerIcon, movesArray: new Queue<Move>(3), type: 'human' as const },
      gameStatus: 'not-started' as GameStatus,
      gameMode: 'multiplayer' as GameMode
    };
    this.updateGameState(resetState);
  }

  isToBeRemoved(row: number, column: number): boolean {
    const state = this.currentGameState;
    if (state.gameStatus !== 'in-progress') return false;

    const currentPlayer = state.currentPlayerIcon === 'X' ? state.player1 : state.player2;
    if (currentPlayer.movesArray.items.length === 3) {
      const oldestMove = currentPlayer.movesArray.peekFirst();
      return oldestMove ? (oldestMove.row === row && oldestMove.column === column) : false;
    }
    return false;
  }

  isWinningCell(row: number, column: number): boolean {
    const state = this.currentGameState;
    if (state.gameStatus === 'finished' && state.currentPlayer) {
      return state.currentPlayer.movesArray.items.some((move) =>
        move.row === row && move.column === column
      );
    }
    return false;
  }

  private checkForWin(player: Player): boolean {
    const moves = [...player.movesArray.items];
    const rows = moves.map(move => move.row);
    const columns = moves.map(move => move.column);

    // Check row win
    if (rows.every(val => val === rows[0])) return true;

    // Check column win
    if (columns.every(val => val === columns[0])) return true;

    // Check main diagonal
    if (rows.every((row, index) => row === columns[index])) return true;


    moves.sort((a, b) => a.row - b.row || a.column - b.column);
    const antiDiagMoves = [{row: 2, column: 0}, {row: 1, column: 1}, {row: 0, column: 2}];

    // Check anti-diagonal
    if (moves.every((move, index) => move.row === antiDiagMoves[index].row && move.column === antiDiagMoves[index].column)) {
      return true;
    }

    return false;
  }

  private updateGameState(newState: GameState): void {
    this.gameStateSubject.next(newState);
  }

  private getHumanLossMessage(aiDifficulty: AIDifficulty, humanPlayerName: string): string {
    const lossMessages = {
      easy: [
        `💀 ${humanPlayerName}, you just lost to the EASIEST bot! That's... wow... just wow! 😅`,
        `🤭 Oops! ${humanPlayerName} got rekt by Rookie Bot! Maybe try hopscotch instead? 🦘`,
        `😱 ${humanPlayerName}, even the training wheels bot beat you! Have you tried turning yourself off and on again? �`,
        `🙈 ${humanPlayerName} lost to Easy mode?! The bot was literally playing with its eyes closed! 😴`,
        `💸 ${humanPlayerName}, you just got schooled by a bot that flips coins for moves! Sir/Ma'am, this is concerning! 🪙`,
        `🤡 ${humanPlayerName}, the Rookie Bot is sending you a participation trophy! 🏆`,
        `🧠 ${humanPlayerName}, the Easy Bot used 0.1% of its brain power... and still won! 🤖`,
        `🚨 ALERT: ${humanPlayerName} lost to a bot that googles "how to tic tac toe" mid-game! 📱`,
        `🎪 Ladies and gentlemen, ${humanPlayerName} just got outplayed by digital training wheels! 🎭`,
        `🍝 ${humanPlayerName}, you got spaghetti-coded by the simplest AI known to mankind! 🤌`
      ],
      medium: [
        `😤 ${humanPlayerName}, Tactical Bot outplayed you! Time to study some strategy! 🎯`,
        `🧠 ${humanPlayerName} vs Tactical Bot: Bot wins with superior tactics! 🤖`,
        `⚡ ${humanPlayerName}, you got tactically destroyed! The bot saw that coming from orbit! �️`,
        `🎪 ${humanPlayerName}, Tactical Bot just gave you a masterclass in strategy! �`,
        `🔥 ${humanPlayerName}, that bot played you like a chess grandmaster plays checkers! ♟️`,
        `🎯 ${humanPlayerName}, Tactical Bot hit you with that calculated precision! 🎱`,
        `⚔️ ${humanPlayerName} walked into Tactical Bot's trap! Classic mistake! 🕳️`
      ],
      hard: [
        `🏆 ${humanPlayerName}, Master Bot is simply on another level! Bow to the machine overlord! 🤖👑`,
        `⚔️ ${humanPlayerName} faced the ultimate challenge and... well, you tried! Master Bot reigns supreme! 👑`,
        `🧬 ${humanPlayerName}, you were defeated by superior AI intelligence! The machines are learning! 🤯`,
        `🚀 ${humanPlayerName}, Master Bot just demonstrated peak AI performance! You witnessed greatness! 💪`,
        `🎭 ${humanPlayerName}, you've been outmatched by the AI overlord! Resistance was futile! 🤖👑`,
        `🌌 ${humanPlayerName}, Master Bot operates on a cosmic level of strategy! You're playing tic-tac-toe, it's playing 4D chess! ♾️`,
        `⚡ ${humanPlayerName}, Master Bot calculated your defeat 17 moves ago! Welcome to the future! 🔮`
      ]
    };

    const messages = lossMessages[aiDifficulty];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getHumanWinMessage(aiDifficulty: AIDifficulty, humanPlayerName: string): string {
    const winMessages = {
      easy: [
        `🎉 ${humanPlayerName} defeated Rookie Bot! Hey, everyone starts somewhere! 🌟`,
        `✨ ${humanPlayerName} wins! You've mastered the art of beating training wheels! 🎓`,
        `🎊 ${humanPlayerName} conquered the easy challenge! Ready to face a real opponent? 💪`,
        `🥳 ${humanPlayerName} vs Rookie Bot: Human intelligence prevails! (As it should!) 🧠`,
        `🎈 ${humanPlayerName} wins! Rookie Bot tips its digital hat to you! 🎩`
      ],
      medium: [
        `🔥 ${humanPlayerName} outsmarted Tactical Bot! Now THAT'S strategic thinking! 🧠`,
        `⚡ ${humanPlayerName} wins! You just beat a thinking opponent! Impressive! 🎯`,
        `🏅 ${humanPlayerName} defeated Tactical Bot with superior tactics! Well played! 🎖️`,
        `🎯 ${humanPlayerName} hit the tactical bullseye! Tactical Bot is impressed! 🎪`,
        `⚔️ ${humanPlayerName} conquered the strategic challenge! Victory tastes sweet! 🍯`
      ],
      hard: [
        `👑 ${humanPlayerName} DEFEATED MASTER BOT! You are the ULTIMATE CHAMPION! 🏆`,
        `🌟 ${humanPlayerName} conquered the AI overlord! LEGENDARY performance! ⭐`,
        `🚀 ${humanPlayerName} vs Master Bot: EPIC HUMAN VICTORY! You're unstoppable! 💥`,
        `🎆 ${humanPlayerName} achieved the impossible! Master Bot has been CONQUERED! 🎇`,
        `🌌 ${humanPlayerName} transcended to tic-tac-toe godhood! Master Bot bows to you! 🙇‍♂️`,
        `⚡ ${humanPlayerName} pulled off a miracle! The machines shall remember this day! 📅`
      ]
    };

    const messages = winMessages[aiDifficulty];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}
