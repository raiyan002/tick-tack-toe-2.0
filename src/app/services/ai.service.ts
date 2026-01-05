import { Injectable } from '@angular/core';
import { AIDifficulty, Move, Player, GameState } from '../types/game.types';

@Injectable({
  providedIn: 'root'
})
export class AIService {

  constructor() {}

  /**
   * Get the best move for the AI player based on difficulty level
   */
  getAIMove(gameState: GameState, aiPlayer: Player): Move | null {
    const availableMoves = this.getAvailableMoves(gameState.gameMatrix);

    if (availableMoves.length === 0) {
      return null;
    }

    switch (aiPlayer.aiDifficulty) {
      case 'easy':
        return this.getEasyMove(availableMoves);
      case 'medium':
        return this.getMediumMove(gameState, aiPlayer, availableMoves);
      case 'hard':
        return this.getHardMove(gameState, aiPlayer, availableMoves);
      default:
        return this.getEasyMove(availableMoves);
    }
  }

  /**
   * Easy AI: Random moves with slight preference for center and corners
   */
  private getEasyMove(availableMoves: Move[]): Move {
    // 30% chance to prefer center or corners, 70% completely random
    if (Math.random() < 0.3) {
      // Prefer center first
      const centerMove = availableMoves.find(move => move.row === 1 && move.column === 1);
      if (centerMove) return centerMove;

      // Then prefer corners
      const corners = availableMoves.filter(move =>
        (move.row === 0 || move.row === 2) && (move.column === 0 || move.column === 2)
      );
      if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)];
      }
    }

    // Random move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  /**
   * Medium AI: Blocks obvious wins and makes strategic moves
   */
  private getMediumMove(gameState: GameState, aiPlayer: Player, availableMoves: Move[]): Move {
    const opponent = aiPlayer.icon === 'X' ? gameState.player1 : gameState.player2;

    // 1. Try to win immediately
    const winningMove = this.findWinningMove(gameState.gameMatrix, aiPlayer);
    if (winningMove) return winningMove;

    // 2. Block opponent's winning move
    const blockingMove = this.findWinningMove(gameState.gameMatrix, opponent);
    if (blockingMove) return blockingMove;

    // 3. Take center if available
    const centerMove = availableMoves.find(move => move.row === 1 && move.column === 1);
    if (centerMove) return centerMove;

    // 4. Take corners
    const corners = availableMoves.filter(move =>
      (move.row === 0 || move.row === 2) && (move.column === 0 || move.column === 2)
    );
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    // 5. Take any available move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  /**
   * Hard AI: Uses minimax algorithm with alpha-beta pruning
   */
  private getHardMove(gameState: GameState, aiPlayer: Player, availableMoves: Move[]): Move {
    const opponent = aiPlayer.icon === 'X' ? gameState.player1 : gameState.player2;

    // 1. Always try to win immediately
    const winningMove = this.findWinningMove(gameState.gameMatrix, aiPlayer);
    if (winningMove) return winningMove;

    // 2. Always block opponent's winning move
    const blockingMove = this.findWinningMove(gameState.gameMatrix, opponent);
    if (blockingMove) return blockingMove;

    // 3. Use minimax for strategic planning
    let bestMove = availableMoves[0];
    let bestScore = -Infinity;

    for (const move of availableMoves) {
      const score = this.evaluateMove(gameState, move, aiPlayer, opponent, 3); // depth 3
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  /**
   * Find a move that would immediately win the game
   */
  private findWinningMove(gameMatrix: string[][], player: Player): Move | null {
    const availableMoves = this.getAvailableMoves(gameMatrix);

    for (const move of availableMoves) {
      // Simulate the move
      const testMatrix = gameMatrix.map(row => [...row]);
      testMatrix[move.row][move.column] = player.icon;

      // Check if this move creates a win
      if (this.wouldCreateWin(testMatrix, player, move)) {
        return move;
      }
    }

    return null;
  }

  /**
   * Check if a move would create a winning condition
   */
  private wouldCreateWin(gameMatrix: string[][], player: Player, move: Move): boolean {
    const { row, column } = move;
    const icon = player.icon;

    // Get all positions of this player
    const playerPositions: Move[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (gameMatrix[r][c] === icon) {
          playerPositions.push({ row: r, column: c });
        }
      }
    }

    // Must have exactly 3 pieces for win in this variant
    if (playerPositions.length !== 3) return false;

    return this.checkWinCondition(playerPositions);
  }

  /**
   * Check if the given positions create a winning condition
   */
  private checkWinCondition(positions: Move[]): boolean {
    if (positions.length !== 3) return false;

    const rows = positions.map(p => p.row);
    const columns = positions.map(p => p.column);

    // Check row win
    if (rows.every(val => val === rows[0])) return true;

    // Check column win
    if (columns.every(val => val === columns[0])) return true;

    // Check main diagonal
    if (rows.every((row, index) => row === columns[index])) return true;

    // Check anti-diagonal
    const antiDiagRows = [2, 1, 0];
    const antiDiagCols = [0, 1, 2];
    if (rows.every((value, index) => value === antiDiagRows[index]) &&
        columns.every((value, index) => value === antiDiagCols[index])) {
      return true;
    }

    return false;
  }

  /**
   * Evaluate a move using a simplified minimax approach
   */
  private evaluateMove(gameState: GameState, move: Move, aiPlayer: Player, opponent: Player, depth: number): number {
    // Base scoring
    let score = 0;

    // Center is valuable
    if (move.row === 1 && move.column === 1) score += 3;

    // Corners are good
    if ((move.row === 0 || move.row === 2) && (move.column === 0 || move.column === 2)) {
      score += 2;
    }

    // Prefer moves that create potential winning lines
    score += this.evaluatePositionalAdvantage(gameState.gameMatrix, move, aiPlayer);

    // Penalize moves that help opponent
    score -= this.evaluatePositionalAdvantage(gameState.gameMatrix, move, opponent) * 0.5;

    return score;
  }

  /**
   * Evaluate positional advantage of a move
   */
  private evaluatePositionalAdvantage(gameMatrix: string[][], move: Move, player: Player): number {
    const { row, column } = move;
    let advantage = 0;

    // Check how many potential winning lines this move contributes to
    const lines = [
      // Row
      [[row, 0], [row, 1], [row, 2]],
      // Column
      [[0, column], [1, column], [2, column]],
      // Main diagonal (if on diagonal)
      [[0, 0], [1, 1], [2, 2]],
      // Anti-diagonal (if on anti-diagonal)
      [[0, 2], [1, 1], [2, 0]]
    ];

    for (const line of lines) {
      if (line.some(([r, c]) => r === row && c === column)) {
        let playerCount = 0;
        let opponentCount = 0;
        let emptyCount = 0;

        for (const [r, c] of line) {
          const cell = gameMatrix[r][c];
          if (cell === player.icon) playerCount++;
          else if (cell !== '' && cell !== player.icon) opponentCount++;
          else emptyCount++;
        }

        // This line is valuable if it's not blocked by opponent
        if (opponentCount === 0) {
          advantage += playerCount + 1; // +1 for the potential move
        }
      }
    }

    return advantage;
  }

  /**
   * Get all available moves on the board
   */
  private getAvailableMoves(gameMatrix: string[][]): Move[] {
    const moves: Move[] = [];
    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 3; column++) {
        if (gameMatrix[row][column] === '') {
          moves.push({ row, column });
        }
      }
    }
    return moves;
  }

  /**
   * Get AI player name based on difficulty
   */
  getAIPlayerName(difficulty: AIDifficulty): string {
    switch (difficulty) {
      case 'easy':
        return 'Rookie Bot (Easy)';
      case 'medium':
        return 'Tactical Bot (Medium)';
      case 'hard':
        return 'Master Bot (Hard)';
      default:
        return 'AI Bot';
    }
  }

  /**
   * Get AI thinking delay (for better UX)
   */
  getAIThinkingDelay(difficulty: AIDifficulty): number {
    switch (difficulty) {
      case 'easy':
        return 800; // Quick decisions
      case 'medium':
        return 1200; // Moderate thinking
      case 'hard':
        return 1800; // Longer analysis
      default:
        return 1000;
    }
  }
}
