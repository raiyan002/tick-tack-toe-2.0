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
    if(this.player1.name && this.player2.name) {
      this.gameStatus = 'in progress'; // Set game status to in progress
    }
    else{
      alert('Please enter player names! to start.');
      return;
    }
     
  }


  makeMove(row: number, column: number) {
    const currentPlayer = this.currentPlayerIcon === 'X' ? this.player1 : this.player2;

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


    // Check if the game is already won
     
      this.gameStatus = 'in progress'; // Set game status to in progress
      const move:move = { row:row, column:column };
      currentPlayer.movesArray.enqueue(move);
      this.gameMatrix[row][column] = this.currentPlayerIcon;
      if(currentPlayer.rowToremove >= 0 && currentPlayer.columnToremove >= 0) {
        this.gameMatrix[currentPlayer.rowToremove][currentPlayer.columnToremove] = ''; // Clear the last move
      }
      if(currentPlayer.movesArray.items.length === 3) {
        currentPlayer.rowToremove = currentPlayer.movesArray.peekLast()?.row;
        currentPlayer.columnToremove = currentPlayer.movesArray.peekLast()?.column;
      }
      this.currentPlayerIcon = this.currentPlayerIcon === 'X' ? 'O' : 'X'; // Switch player



    console.log('Move made:', this.gameMatrix);
    if(currentPlayer.movesArray.items.length === 3) {
    this.checkForWin(currentPlayer);
    if (this.gameStatus === 'finished') {
      console.log(`${currentPlayer.name} wins!`);
      timer(1000).subscribe(() => {
        confirm(`${currentPlayer.name} wins!`) ? this.resetGame() : this.resetGame();
        
      });
    }
    }
    console.log('Current player:', currentPlayer);
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
}
