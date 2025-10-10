import { Component, OnInit } from '@angular/core';
import { FlashcardService } from '../flashcard.service';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Flashcard } from '../models/flashcard';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-meaning-test',
  templateUrl: './meaning-test.component.html',
  imports: [CommonModule, MatRadioModule, FormsModule, RouterLink],
  standalone: true,
  styleUrls: ['./meaning-test.component.css']
})
export class MeaningTestComponent implements OnInit {
  flashcards: Flashcard[] = [];
  currentQuestionIndex: number = 0;
  options: string[] = [];
  correctAnswer: string = '';
  userAnswer: string | null = null;
  score: number = 0;
  showResult: boolean = false;
  noFlashcards: boolean = false;
  immediateFeedback: string | null = null;
  mistakes: Flashcard[] = []; // store wrong answers
  mistakes$!: Observable<Flashcard[]>;

  isChecked: boolean = false; // ✅ has user clicked "Check My Answer"
  disableCheck: boolean = false; // ✅ to avoid multiple clicks
  disableOptions: boolean = false; // ✅ disable answers after checking

  constructor(private flashcardService: FlashcardService, private router: Router) {}

  ngOnInit(): void {
    this.mistakes$ = this.flashcardService.mistakes$;
    this.flashcardService.getFlashcards().subscribe(flashcards => {
      this.flashcards = flashcards;
      if (this.flashcards.length > 0) {
        this.loadQuestion();
      } else {
        this.noFlashcards = true;
      }
    });
  }

  loadQuestion(): void {
    if (this.flashcards.length > 0 && this.currentQuestionIndex < this.flashcards.length) {
      const currentFlashcard = this.flashcards[this.currentQuestionIndex];
      this.correctAnswer = currentFlashcard.word;
      this.options = this.generateOptions(currentFlashcard.word);
      this.immediateFeedback = null;
      this.userAnswer = null;
      this.isChecked = false;
      this.disableCheck = false;
      this.disableOptions = false;
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

  checkAnswer(): void {
    if (this.disableCheck || !this.userAnswer) return;

    this.disableCheck = true;
    this.disableOptions = true;
    this.isChecked = true;

    const currentFlashcard = this.flashcards[this.currentQuestionIndex];

    if (this.userAnswer === this.correctAnswer) {
      this.immediateFeedback = `✅ Correct! "${this.correctAnswer}" is the right answer.`;
      this.score++;
    } else {
      this.immediateFeedback = `❌ Incorrect. The correct answer is "${this.correctAnswer}".`;
      this.flashcardService.addMistake(currentFlashcard);
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.flashcards.length - 1) {
      this.currentQuestionIndex++;
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
    this.loadQuestion();
  }

  goToMistakesTest(): void {
    this.router.navigate(['/mistakes-test']);
  }
}
