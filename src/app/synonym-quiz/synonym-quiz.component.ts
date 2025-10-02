import { Component, OnInit } from '@angular/core';
import { FlashcardService } from '../flashcard.service';
import { Flashcard } from '../models/flashcard';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';

@Component({
  selector: 'app-synonym-quiz',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './synonym-quiz.component.html',
  styleUrls: ['./synonym-quiz.component.css']
})
export class SynonymQuizComponent implements OnInit {
  allFlashcards: Flashcard[] = [];
  synonymCards: Flashcard[] = [];
  currentCard: Flashcard | null = null;
  options: string[] = [];
  selected = new Set<string>();
  feedback: string = '';
  currentIndex: number = 0;
  finished: boolean = false;
  // inside the class
  answered: boolean = false;  // ✅ track if current question was checked

  // ✅ Score tracking
  correctAnswers: number = 0;

  constructor(
    private flashcardService: FlashcardService,
    private router: Router
  ) {}

  ngOnInit() {
    this.flashcardService.getFlashcards().subscribe(cards => {
      this.synonymCards = cards.filter(c => (c.synonyms?.length ?? 0) > 0);
      this.allFlashcards = this.synonymCards;
      if (this.synonymCards.length > 0) {
        this.pickCard();
      }
    });
  }

  getDistractors(correct: string[], count: number): string[] {
    const pool = this.synonymCards
      .flatMap(c => c.synonyms ?? [])
      .filter(s => !correct.includes(s));

    const unique = Array.from(new Set(pool));
    return unique.sort(() => Math.random() - 0.5).slice(0, count);
  }

  toggleOption(option: string) {
    if (this.selected.has(option)) {
      this.selected.delete(option);
    } else {
      this.selected.add(option);
    }
  }

  pickCard() {
    this.feedback = '';
    this.selected.clear();
    this.answered = false;   // ✅ reset for new card

    if (!this.synonymCards.length) {
      this.currentCard = null;
      return;
    }

    this.currentCard = this.synonymCards[this.currentIndex];
    const correctSynonyms: string[] = this.currentCard.synonyms ?? [];

    const distractors = this.getDistractors(correctSynonyms, 4);
    this.options = [...correctSynonyms, ...distractors]
      .sort(() => Math.random() - 0.5);
  }

  checkAnswer() {
    const correct = this.currentCard?.synonyms ?? [];
    const selectedArray = Array.from(this.selected);

    const isCorrect =
      correct.length === selectedArray.length &&
      selectedArray.every(s => correct.includes(s));

    if (isCorrect) {
      this.feedback = '✅ Correct!';
      this.correctAnswers++;
    } else {
      this.feedback = `❌ Wrong. Correct answers: ${correct.join(', ')}`;
    }

    this.answered = true;   // ✅ allow Next button now
  }

  nextCard() {
    if (this.currentIndex < this.synonymCards.length - 1) {
      this.currentIndex++;
      this.pickCard();
    } else {
      this.feedback = '🎉 You finished all synonym quizzes!';
      this.finished = true;
      this.currentCard = null;
    }
  }


  retakeQuiz() {
    this.currentIndex = 0;
    this.finished = false;
    this.correctAnswers = 0;   // ✅ reset score
    this.pickCard();
  }

  goToFlashcards() {
    this.router.navigate(['/flashcards']);
  }

  get progressText(): string {
    return `${this.currentIndex + 1}/${this.synonymCards.length}`;
  }
}
