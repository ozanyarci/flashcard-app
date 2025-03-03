import { Component, OnInit } from '@angular/core';
import { FlashcardService } from '../flashcard.service';
import { Flashcard } from '../flashcard.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  imports: [CommonModule,MatInputModule,MatButtonModule,MatCardModule,MatToolbarModule,FormsModule,MatIconModule,MatRadioModule,RouterLink, RouterLinkActive],
  standalone:true,
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  flashcards: Flashcard[] = [];
  currentQuestionIndex: number = 0;
  options: string[] = [];
  correctAnswer: string = '';
  userAnswer: string = '';
  score: number = 0;
  showResult: boolean = false;
  noFlashcards: boolean = false;

  constructor(private flashcardService: FlashcardService) { }

  ngOnInit(): void {
    this.flashcards = this.flashcardService.getFlashcards();
    if (this.flashcards.length > 0) {
      this.loadQuestion();
    } else {
      this.noFlashcards = true;
    }
  }

  loadQuestion(): void {
    if (this.flashcards.length > 0) {
      if (this.currentQuestionIndex >= this.flashcards.length) {
        this.currentQuestionIndex = 0;  // Reset to the first question if index is out of bounds
      }
      const currentFlashcard = this.flashcards[this.currentQuestionIndex];
      this.correctAnswer = currentFlashcard.meaning;
      this.options = this.generateOptions(currentFlashcard.meaning);
    }
  }

  generateOptions(correctAnswer: string): string[] {
    const options = [correctAnswer];
    while (options.length < 4 && this.flashcards.length > 1) {
      const randomIndex = Math.floor(Math.random() * this.flashcards.length);
      const option = this.flashcards[randomIndex].meaning;
      if (!options.includes(option)) {
        options.push(option);
      }
    }
    return this.shuffle(options);
  }

  shuffle(array: any[]): any[] {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  submitAnswer(): void {
    if (this.userAnswer === this.correctAnswer) {
      this.score++;
    }
    if (this.currentQuestionIndex < this.flashcards.length - 1) {
      this.currentQuestionIndex++;
      this.userAnswer = '';
      this.loadQuestion();
    } else {
      this.showResult = true;
    }
  }

  restartTest(): void {
    this.currentQuestionIndex = 0;
    this.userAnswer = '';
    this.score = 0;
    this.showResult = false;
    if (this.flashcards.length > 0) {
      this.loadQuestion();
    } else {
      this.noFlashcards = true;
    }
  }
}
