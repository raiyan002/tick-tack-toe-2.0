export type GameStatus = 'not-started' | 'in-progress' | 'finished';
export type MessageType = 'info' | 'warning' | 'success' | 'error';
export type PlayerIcon = 'X' | 'O';
export type GameMode = 'multiplayer' | 'single-player';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type PlayerType = 'human' | 'ai';

export interface Move {
  row: number;
  column: number;
}

export interface Player {
  name: string;
  icon: PlayerIcon;
  movesArray: Queue<Move>;
  type: PlayerType;
  aiDifficulty?: AIDifficulty;
}

export interface GameState {
  gameMatrix: string[][];
  currentPlayerIcon: PlayerIcon;
  player1: Player;
  player2: Player;
  gameStatus: GameStatus;
  gameMode: GameMode;
  currentPlayer?: Player;
}

export interface GameMessage {
  text: string;
  type: MessageType;
  duration?: number;
}

export class Queue<T> {
  public items: Move[] = [];
  private maxSize: number = 3;

  constructor(maxSize: number = 3) {
    this.maxSize = maxSize;
  }

  enqueue(item: Move): void {
    if (this.items.length >= this.maxSize) {
      this.dequeue();
    }
    this.items.push(item);
  }

  dequeue(): Move | undefined {
    return this.items.shift();
  }

  peekFirst(): Move | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}
