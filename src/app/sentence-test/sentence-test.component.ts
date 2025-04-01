// src/app/sentence-test/sentence-test.component.ts

import { Component, OnInit } from '@angular/core';
import { FlashcardService, Flashcard } from '../flashcard.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sentence-test',
  imports: [CommonModule,MatInputModule,MatButtonModule,MatCardModule,MatToolbarModule,FormsModule,MatIconModule,RouterLink],
  standalone: true,
  templateUrl: './sentence-test.component.html',
  styleUrls: ['./sentence-test.component.css']
})
export class SentenceTestComponent implements OnInit {
  flashcards: Flashcard[] = [];
  flashcardsWithExamples: Flashcard[] = [];
  currentQuestionIndex: number = 0;
  correctAnswer: string = '';
  userAnswer: string = '';
  score: number = 0;
  showResult: boolean = false;
  noFlashcards: boolean = false;
  exampleSentence: string = '';
  immediateFeedback: string | null = null; // Store feedback message

  constructor(private flashcardService: FlashcardService) { }

  ngOnInit(): void {
    this.flashcards = this.flashcardService.getFlashcards();
    this.flashcardsWithExamples = this.flashcards.filter(flashcard => flashcard.example?.trim());
    if (this.flashcardsWithExamples.length > 0) {
      this.loadQuestion();
    } else {
      this.noFlashcards = true;
    }
  }

  loadQuestion(): void {
    if (this.flashcardsWithExamples.length > 0 && this.currentQuestionIndex < this.flashcardsWithExamples.length) {
      const flashcard = this.flashcardsWithExamples[this.currentQuestionIndex];
      this.correctAnswer = flashcard.word;
      this.exampleSentence = flashcard.example ? flashcard.example.toLowerCase().replace(flashcard.word.toLowerCase(), '__________') : '';
      this.immediateFeedback = null; // Reset feedback for new question
      this.userAnswer = '';  // Clear user answer for new question
    }
  }

  checkAnswer(): void {
    if (this.userAnswer.trim().toLowerCase() === this.correctAnswer.toLowerCase()) {
      this.score++;
      this.immediateFeedback = `Correct! The answer is "${this.correctAnswer}".`;
    } else {
      this.immediateFeedback = `Incorrect. The correct answer is "${this.correctAnswer}".`;
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.flashcardsWithExamples.length - 1) {
      this.currentQuestionIndex++;
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
    if (this.flashcardsWithExamples.length > 0) {
      this.loadQuestion();
    } else {
      this.noFlashcards = true;
    }
  }
}
