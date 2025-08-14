import { Component, OnInit } from '@angular/core';
import { FlashcardService } from '../flashcard.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Flashcard } from '../models/flashcard';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    FormsModule,
    MatIconModule,
    MatRadioModule,
    RouterLink
  ],
  standalone: true,
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  flashcards: Flashcard[] = [];
  filteredFlashcards: Flashcard[] = []; // Add this line
  currentQuestionIndex: number = 0;
  options: string[] = [];
  correctAnswer: string = '';
  userAnswer: string | null = null;
  score: number = 0;
  showResult: boolean = false;
  noFlashcards: boolean = false;
  immediateFeedback: string | null = null;

  constructor(private flashcardService: FlashcardService) {}

  ngOnInit(): void {
    this.flashcardService.getFlashcards().subscribe(flashcards => {
      this.flashcards = flashcards;
      // Filter flashcards to include only favorites
      this.filteredFlashcards = this.flashcards.filter(flashcard => flashcard.favorite);
      if (this.filteredFlashcards.length > 0) {
        this.loadQuestion();
      } else {
        this.noFlashcards = true;
      }
    });
  }

  loadQuestion(): void {
    if (this.filteredFlashcards.length > 0 && this.currentQuestionIndex < this.filteredFlashcards.length) {
      const currentFlashcard = this.filteredFlashcards[this.currentQuestionIndex];
      this.correctAnswer = currentFlashcard.meaning;
      this.options = this.generateOptions(currentFlashcard.meaning);
      this.immediateFeedback = null; // Reset feedback for each new question
    }
  }

  generateOptions(correctAnswer: string): string[] {
    const options = [correctAnswer];
    const meanings = this.filteredFlashcards.map(fc => fc.meaning);
    while (options.length < 4) {
      const randomIndex = Math.floor(Math.random() * meanings.length);
      const option = meanings[randomIndex];
      if (!options.includes(option)) {
        options.push(option);
      }
    }
    return this.shuffle(options);
  }

  shuffle(array: any[]): any[] {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  checkAnswer(answer: string): void {
    this.userAnswer = answer;
    if (this.userAnswer === this.correctAnswer) {
      this.immediateFeedback = `Correct! "${this.correctAnswer}" is the right answer.`;
      this.score++;
    } else {
      this.immediateFeedback = `Incorrect. The correct answer is "${this.correctAnswer}".`;
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.filteredFlashcards.length - 1) {
      this.currentQuestionIndex++;
      this.userAnswer = null;
      this.loadQuestion();
    } else {
      this.showResult = true;
    }
  }

  restartTest(): void {
    this.currentQuestionIndex = 0;
    this.userAnswer = null;
    this.score = 0;
    this.showResult = false;
    if (this.filteredFlashcards.length > 0) {
      this.loadQuestion();
    } else {
      this.noFlashcards = true;
    }
  }
}