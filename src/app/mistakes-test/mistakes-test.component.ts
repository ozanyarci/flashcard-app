// src/app/mistakes-test/mistakes-test.component.ts

import { Component, OnInit } from '@angular/core';
import { FlashcardService } from '../flashcard.service';
import { Flashcard } from '../models/flashcard';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {MatCardModule} from '@angular/material/card';
@Component({
  selector: 'app-mistakes-test',
  standalone: true,
  imports: [CommonModule, MatRadioModule, FormsModule, RouterLink, MatCardModule],
  templateUrl: './mistakes-test.component.html',
  styleUrls: ['./mistakes-test.component.css']
})
export class MistakesTestComponent implements OnInit {
  flashcards: Flashcard[] = [];
  currentQuestionIndex: number = 0;
  options: string[] = [];
  correctAnswer: string = '';
  userAnswer: string | null = null;
  score: number = 0;
  showResult: boolean = false;
  noMistakes: boolean = false;
  immediateFeedback: string | null = null;

  constructor(private flashcardService: FlashcardService) {}

  ngOnInit(): void {
    this.flashcards = this.flashcardService.getMistakes();
    if (this.flashcards.length > 0) {
      this.loadQuestion();
    } else {
      this.noMistakes = true;
    }
  }

  loadQuestion(): void {
    if (this.currentQuestionIndex < this.flashcards.length) {
      const currentFlashcard = this.flashcards[this.currentQuestionIndex];
      this.correctAnswer = currentFlashcard.word;
      this.options = this.generateOptions(currentFlashcard.word);
      this.immediateFeedback = null;
    }
  }

  generateOptions(correctAnswer: string): string[] {
    const options = [correctAnswer];
    while (options.length < 4 && this.flashcards.length > 1) {
      const randomIndex = Math.floor(Math.random() * this.flashcards.length);
      const option = this.flashcards[randomIndex].word;
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
    if (this.currentQuestionIndex < this.flashcards.length - 1) {
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
    if (this.flashcards.length > 0) {
      this.loadQuestion();
    } else {
      this.noMistakes = true;
    }
  }
}
