import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { move, playerMoves, Queue } from './models/game-model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { timer } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule, 
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Tick-Tack_Toe-2.0';
  gameMatrix: string[][] = [];
  currentPlayerIcon: string = 'X'; // X starts first
  player1:playerMoves = { name: '', icon: 'X', rowToremove:-1, columnToremove:-1, movesArray: new Queue<move>(3) };
  player2:playerMoves = { name: '', icon: 'O', rowToremove:-1, columnToremove:-1, movesArray: new Queue<move>(3) };
  gameStatus: string = 'not started'; // Game status can be 'not started', 'in progress', or 'finished'
  playerFrom!: FormGroup;
  currentPlayer!: playerMoves;
  constructor(
    private formBuilder: FormBuilder
  ) {
    console.log('AppComponent initialized');
  }
  


  ngOnInit() {
    console.log('AppComponent ngOnInit called');
    this.initializeMatrix();
    this.initializePlayerForm();
  }

  initializePlayerForm() {
    this.playerFrom = this.formBuilder.group({
      player1: ['', [Validators.required]],
      player2: ['', [Validators.required]]
    });
  }

  initializeMatrix() {
    this.gameMatrix = Array.from({ length: 3 }, () => Array(3).fill(''));
    console.log('Matrix initialized:', this.gameMatrix);
  }

  startGame() {
    this.player1.name = this.playerFrom.get('player1')?.value;
    this.player2.name = this.playerFrom.get('player2')?.value;
    if(this.gameStatus === 'not started') {
      if(this.player1.name && this.player2.name) {
        this.gameStatus = 'in progress'; // Set game status to in progress
      }
      else{
        alert('Please enter player names! to start.');
        return;
      }
    }
    else if(this.gameStatus === 'finished' || this.gameStatus === 'in progress') {
      this.resetGame(); // Reset the game if it was finished or in progress
      this.startGame(); // Start a new game
    }

    
     
  }


  makeMove(row: number, column: number) {

    // Check if the game is already won or not started
    if (this.gameMatrix[row][column] !== ''  || this.gameStatus === 'finished' || this.gameStatus === 'not started') {
      switch(this.gameStatus) {
        case 'not started':
          alert('Please start the game first!');
          break;
        case 'finished':
          alert('Game is already finished! Please reset the game to play again.');
          break;
        default:
      }
      return;
    }

    this.currentPlayer = this.currentPlayerIcon === 'X' ? this.player1 : this.player2;
    
      this.gameStatus = 'in progress'; // Set game status to in progress
      const move:move = { row:row, column:column };
      this.currentPlayer.movesArray.enqueue(move);
      this.gameMatrix[row][column] = this.currentPlayerIcon;
      if(this.currentPlayer.rowToremove >= 0 && this.currentPlayer.columnToremove >= 0) {
        this.gameMatrix[this.currentPlayer.rowToremove][this.currentPlayer.columnToremove] = ''; // Clear the last move
      }
      if(this.currentPlayer.movesArray.items.length === 3) {
        this.currentPlayer.rowToremove = this.currentPlayer.movesArray.peekLast()?.row;
        this.currentPlayer.columnToremove = this.currentPlayer.movesArray.peekLast()?.column;
      }

    console.log('Move made:', this.gameMatrix);
    if(this.currentPlayer.movesArray.items.length === 3) {
    this.checkForWin(this.currentPlayer);
    if (this.gameStatus === 'finished') {
      console.log(`${this.currentPlayer.name} wins!`);
      timer(1000).subscribe(() => {
        confirm(`${this.currentPlayer.name} wins!`) ? this.resetGame() : this.resetGame();
        
      });
    }
    }
    this.currentPlayerIcon = this.currentPlayerIcon === 'X' ? 'O' : 'X'; // Switch player
    console.log('Current player:', this.currentPlayer);
  }

  checkForWin(currentPlayer: playerMoves) {
    const moves = currentPlayer.movesArray.items;
    const rows = moves.map(move => move.row);
    const columns = moves.map(move => move.column);

    // Check for winning conditions
    this.checkConditions(rows, columns, currentPlayer.name);
  }

  checkConditions(rows: number[], columns: number[], Name: string) {
    rows.every(val => val === rows[0]) ? this.gameStatus = 'finished' : null;
    columns.every(val => val === columns[0]) ? this.gameStatus = 'finished' : null;
    rows.every((row, index) => row === columns[index]) ? this.gameStatus = 'finished' : null;

    let tempRow = [2, 1, 0];
    let tempColumn = [0, 1, 2];
    rows.every((value, index) => value === tempRow[index]) && columns.every((value, index) => value === tempColumn[index]) ? this.gameStatus = 'finished' : null;

  }

  resetGame() {
    this.gameMatrix = Array.from({ length: 3 }, () => Array(3).fill(''));
      this.gameStatus = 'not started'; // Reset game status
      this.player1 ={ name: '', icon: 'X', rowToremove:-1, columnToremove:-1, movesArray: new Queue<move>(3) }; // Reset player 1 moves
      this.player2 = { name: '', icon: 'O', rowToremove:-1, columnToremove:-1, movesArray: new Queue<move>(3) };; // Reset player 2 moves
      this.currentPlayerIcon = 'X'; // Reset current player icon
  }

  isTobeRemoved(row: number, column: number): boolean {
    if(row === this.player1.rowToremove && column === this.player1.columnToremove && this.currentPlayerIcon === 'X' && this.gameStatus === 'in progress') {
      return true;
    }
    if(row === this.player2.rowToremove && column === this.player2.columnToremove && this.currentPlayerIcon === 'O' && this.gameStatus === 'in progress') {
      return true;
    }
    return false;
  }

  highlightWinner(row: number, column: number): boolean {
    if(this.gameStatus === 'finished') {
        return this.currentPlayer.movesArray.items.some((move) => 
          move.row === row && move.column === column
        );
    }
    return false;
  }
}
