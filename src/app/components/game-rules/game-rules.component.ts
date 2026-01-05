import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-game-rules',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatTabsModule
  ],
  template: `
    <mat-card class="rules-card">
      <mat-card-header>
        <mat-card-title>
          <button mat-button (click)="toggleRules()" class="rules-toggle">
            <mat-icon>{{ showRules ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</mat-icon>
            How to Play - Tic-Tac-Toe 2.0
            <mat-icon class="help-icon">help_outline</mat-icon>
          </button>
        </mat-card-title>
      </mat-card-header>

      <mat-card-content *ngIf="showRules" class="rules-content">
        <mat-tab-group class="rules-tabs" dynamicHeight>

          <!-- Basic Rules Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>sports_esports</mat-icon>
              Basic Rules
            </ng-template>
            <div class="tab-content">
              <div class="rules-grid">
                <div class="rule-item featured">
                  <div class="rule-icon-wrapper">
                    <mat-icon class="rule-icon">filter_3</mat-icon>
                  </div>
                  <div class="rule-content">
                    <h4>Only 3 Pieces Rule</h4>
                    <p>Each player can only have <strong>3 pieces</strong> on the board at any time. This is the core mechanic that makes this version unique!</p>
                  </div>
                </div>

                <div class="rule-item">
                  <div class="rule-icon-wrapper">
                    <mat-icon class="rule-icon">swap_horizontal_circle</mat-icon>
                  </div>
                  <div class="rule-content">
                    <h4>Turn-Based Play</h4>
                    <p>Players take turns placing their pieces (X and O) on the 3x3 grid, just like classic tic-tac-toe.</p>
                  </div>
                </div>

                <div class="rule-item">
                  <div class="rule-icon-wrapper">
                    <mat-icon class="rule-icon">emoji_events</mat-icon>
                  </div>
                  <div class="rule-content">
                    <h4>Classic Win Condition</h4>
                    <p>Get 3 of your pieces in a row, column, or diagonal to win the game!</p>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Moving Pieces Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>trending_up</mat-icon>
              Moving Pieces
            </ng-template>
            <div class="tab-content">
              <div class="moving-pieces-explanation">
                <div class="step-by-step">
                  <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <h4>First 3 Moves</h4>
                      <p>Place your first 3 pieces normally on any empty cells.</p>
                      <div class="visual-example">
                        <div class="mini-board">
                          <div class="mini-cell filled">X</div>
                          <div class="mini-cell"></div>
                          <div class="mini-cell filled">X</div>
                          <div class="mini-cell"></div>
                          <div class="mini-cell filled">O</div>
                          <div class="mini-cell"></div>
                          <div class="mini-cell"></div>
                          <div class="mini-cell"></div>
                          <div class="mini-cell filled">X</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <h4>Fourth Move</h4>
                      <p>When you place your 4th piece, your <strong>oldest piece automatically disappears!</strong></p>
                      <div class="visual-example">
                        <mat-icon class="arrow-icon">trending_flat</mat-icon>
                        <div class="mini-board">
                          <div class="mini-cell faded">X</div>
                          <div class="mini-cell"></div>
                          <div class="mini-cell filled">X</div>
                          <div class="mini-cell filled new">X</div>
                          <div class="mini-cell filled">O</div>
                          <div class="mini-cell"></div>
                          <div class="mini-cell"></div>
                          <div class="mini-cell"></div>
                          <div class="mini-cell filled">X</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                      <h4>Strategic Planning</h4>
                      <p>Think ahead! Plan your moves considering which piece will disappear next.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Strategy Tips Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>lightbulb</mat-icon>
              Strategy Tips
            </ng-template>
            <div class="tab-content">
              <div class="strategy-grid">
                <div class="strategy-tip">
                  <mat-icon class="tip-icon">psychology</mat-icon>
                  <h4>Think 3 Moves Ahead</h4>
                  <p>Always consider where your oldest piece will be when you make your next few moves.</p>
                </div>

                <div class="strategy-tip">
                  <mat-icon class="tip-icon">block</mat-icon>
                  <h4>Block & Setup</h4>
                  <p>Use your pieces to both block your opponent and set up your own winning combinations.</p>
                </div>

                <div class="strategy-tip">
                  <mat-icon class="tip-icon">center_focus_strong</mat-icon>
                  <h4>Control the Center</h4>
                  <p>The center position is valuable as it's part of 4 different winning lines.</p>
                </div>

                <div class="strategy-tip">
                  <mat-icon class="tip-icon">schedule</mat-icon>
                  <h4>Timing is Key</h4>
                  <p>Sometimes it's better to wait and let your opponent make the first move in a sequence.</p>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Visual Hints Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>visibility</mat-icon>
              Visual Guide
            </ng-template>
            <div class="tab-content">
              <div class="visual-guide">
                <div class="guide-item">
                  <div class="guide-visual">
                    <div class="demo-piece normal">X</div>
                  </div>
                  <div class="guide-text">
                    <h4>Normal Piece</h4>
                    <p>Regular pieces on the board with full opacity</p>
                  </div>
                </div>

                <div class="guide-item">
                  <div class="guide-visual">
                    <div class="demo-piece faded">O</div>
                  </div>
                  <div class="guide-text">
                    <h4>To Be Removed</h4>
                    <p>Faded pieces will be removed on your next turn</p>
                  </div>
                </div>

                <div class="guide-item">
                  <div class="guide-visual">
                    <div class="demo-piece winner">X</div>
                  </div>
                  <div class="guide-text">
                    <h4>Winning Pieces</h4>
                    <p>Highlighted pieces show the winning combination</p>
                  </div>
                </div>

                <div class="guide-item">
                  <div class="guide-visual">
                    <div class="demo-cell empty"></div>
                  </div>
                  <div class="guide-text">
                    <h4>Available Cell</h4>
                    <p>Empty cells where you can place your next piece</p>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card-content>
    </mat-card>
  `,
  styleUrls: ['./game-rules.component.css']
})
export class GameRulesComponent {
  showRules = false;

  toggleRules(): void {
    this.showRules = !this.showRules;
  }
}
