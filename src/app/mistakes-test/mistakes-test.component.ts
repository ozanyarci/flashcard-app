import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink } from '@angular/router';
import { FlashcardService } from '../flashcard.service';
import { Flashcard } from '../models/flashcard';

@Component({
  selector: 'app-mistakes-test',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatRadioModule,
    MatButtonModule,
    MatCardModule,
    RouterLink
  ],
  templateUrl: './mistakes-test.component.html',
  styleUrls: ['./mistakes-test.component.css']
})
export class MistakesTestComponent implements OnInit {
  mistakes: Flashcard[] = [];
  allFlashcards: Flashcard[] = [];
  currentQuestionIndex = 0;

  // UI state
  options: string[] = [];           // text options (meanings)
  currentWord = '';
  correctMeaning = '';
  selectedOption: string | null = null;
  answered = false;
  feedback: string | null = null;
  score = 0;
  showResult = false;
  noMistakes = false;

  constructor(private flashcardService: FlashcardService, private router: Router) {}

  ngOnInit(): void {
    // load global pool for distractors
    this.flashcardService.getFlashcards().subscribe(all => {
      this.allFlashcards = all || [];
    });

    // subscribe to reactive mistakes list
    this.flashcardService.getMistakes().subscribe(mistakes => {
      this.mistakes = mistakes || [];
      this.noMistakes = this.mistakes.length === 0;

      // if no mistakes -> show message
      if (this.noMistakes) {
        this.showResult = true; // show finished / no mistakes UI
        return;
      }

      // clamp index and load question
      if (this.currentQuestionIndex >= this.mistakes.length) {
        this.currentQuestionIndex = Math.max(0, this.mistakes.length - 1);
      }
      this.loadQuestion();
    });
  }

  private loadQuestion(): void {
    this.answered = false;
    this.selectedOption = null;
    this.feedback = null;
    this.showResult = false;

    if (!this.mistakes || this.mistakes.length === 0) {
      this.noMistakes = true;
      this.showResult = true;
      return;
    }

    const current = this.mistakes[this.currentQuestionIndex];
    this.currentWord = current.word || '';
    this.correctMeaning = current.meaning || '';
    this.options = this.generateOptions(current);
  }

  /**
   * Build unique options (strings). Prioritize other mistakes as distractors,
   * then fall back to allFlashcards to fill up to 4 options. Guarantee no duplicates.
   */
  private generateOptions(correctCard: Flashcard): string[] {
    const set = new Set<string>();
    const correct = (correctCard.meaning || '').trim();
    if (correct) set.add(correct);

    // 1) use other mistakes as distractors
    for (let i = 0; i < this.mistakes.length && set.size < 4; i++) {
      const m = this.mistakes[i];
      const meaning = (m.meaning || '').trim();
      if (meaning && meaning !== correct) set.add(meaning);
    }

    // 2) fallback to global flashcards
    // shuffle a copy for randomness
    const shuffledAll = this.allFlashcards.slice().sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffledAll.length && set.size < 4; i++) {
      const meaning = (shuffledAll[i].meaning || '').trim();
      if (meaning && meaning !== correct) set.add(meaning);
    }

    // Convert to array and shuffle final order
    const arr = Array.from(set);
    return arr.sort(() => Math.random() - 0.5);
  }

  // user clicks Check
  checkAnswer(): void {
    if (this.answered || this.selectedOption == null) return;

    this.answered = true;

    const current = this.mistakes[this.currentQuestionIndex];
    if (!current) return;

    if (this.selectedOption === this.correctMeaning) {
      this.feedback = `✅ Correct — "${this.currentWord}" = ${this.correctMeaning}`;
      this.score++;

      // Remove from mistakes (service will emit updated list)
      this.flashcardService.removeMistake(current);

      // Optimistically update local mistakes so UI is immediate
      this.mistakes = this.mistakes.filter(m => m.id !== current.id);

      // if we removed the last item, finish
      if (this.mistakes.length === 0) {
        this.finishTest();
        return;
      }

      // ensure index doesn't run past end after removal
      if (this.currentQuestionIndex >= this.mistakes.length) {
        this.currentQuestionIndex = Math.max(0, this.mistakes.length - 1);
      }
    } else {
      this.feedback = `❌ Incorrect. Correct meaning: "${this.correctMeaning}"`;
      // Keep in mistakes (no remove)
    }
  }

  nextQuestion(): void {
    if (!this.answered) return; // force check before next

    // If no more items left => finish
    if (this.mistakes.length === 0) {
      this.finishTest();
      return;
    }

    if (this.currentQuestionIndex < this.mistakes.length - 1) {
      this.currentQuestionIndex++;
      this.loadQuestion();
    } else {
      // reached end
      this.finishTest();
    }
  }

  private finishTest(): void {
    this.showResult = true;
    this.noMistakes = this.mistakes.length === 0;
  }

  retryTest(): void {
    // reset counters but keep current mistakes list
    this.score = 0;
    this.currentQuestionIndex = 0;
    this.showResult = false;
    if (this.mistakes.length > 0) this.loadQuestion();
    else this.finishTest();
  }

  backToFlashcards(): void {
    this.router.navigate(['/flashcards']);
  }
}
