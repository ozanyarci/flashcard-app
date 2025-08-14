import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FlashcardService } from '../flashcard.service';
import { Flashcard } from '../models/flashcard';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-image-test',
  templateUrl: './image-test.component.html',
  styleUrls: ['./image-test.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule
  ]
})
export class ImageTestComponent implements OnInit {
  flashcards: Flashcard[] = [];
  currentFlashcard: Flashcard | null = null;
  choices: string[] = [];
  answeredFlashcards: Set<string> = new Set();
  allAnswered: boolean = false;
  correctAnswers: number = 0;
  immediateFeedback: string | null = null;
  answerSelected: boolean = false;
  isCorrect: boolean = false;

  constructor(private flashcardService: FlashcardService, private router: Router) {}

  ngOnInit(): void {
    this.loadFlashcards();
  }

  loadFlashcards() {
    this.flashcardService.getFlashcards().subscribe((flashcards) => {
      // Filter out flashcards without a photo
      this.flashcards = flashcards.filter(flashcard => flashcard.photo);
      this.nextQuestion();
    });
  }

  nextQuestion() {
    this.immediateFeedback = null; // Reset feedback message
    this.answerSelected = false; // Reset the answer selected status

    const unAnsweredFlashcards = this.flashcards.filter(flashcard => !this.answeredFlashcards.has(flashcard.id || ''));
    if (unAnsweredFlashcards.length === 0) {
      this.allAnswered = true;
      return;
    }

    const randomIndex = Math.floor(Math.random() * unAnsweredFlashcards.length);
    this.currentFlashcard = unAnsweredFlashcards[randomIndex];
    this.generateChoices();
  }

  generateChoices() {
    if (!this.currentFlashcard) return;
    const words = this.flashcards.map(flashcard => flashcard.word);
    const correctWord = this.currentFlashcard.word;
    this.choices = [correctWord];

    while (this.choices.length < 4 && words.length > 0) {
      const randomWord = words.splice(Math.floor(Math.random() * words.length), 1);
      if (!this.choices.includes(randomWord[0])) {
        this.choices.push(randomWord[0]);
      }
    }

    this.shuffle(this.choices);
  }

  shuffle(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  checkAnswer(choice: string) {
    this.answerSelected = true; // Set the answer selected status
    if (this.currentFlashcard) {
      if (choice === this.currentFlashcard.word) {
        this.immediateFeedback = 'Correct!';
        this.isCorrect = true;
        this.correctAnswers++;
      } else {
        this.immediateFeedback = `Incorrect! The correct answer is: ${this.currentFlashcard.word}`;
        this.isCorrect = false;
      }
      this.answeredFlashcards.add(this.currentFlashcard.id || '');
    }
  }

  goToFlashcards() {
    this.router.navigate(['/flashcards']);
  }
}