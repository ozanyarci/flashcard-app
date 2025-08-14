import { Component, OnInit } from '@angular/core';
import { FlashcardService } from '../flashcard.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Flashcard } from '../models/flashcard';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-random-test',
  templateUrl: './random-test.component.html',
  imports: [CommonModule, MatInputModule, MatButtonModule, MatCardModule, FormsModule, MatIconModule, MatRadioModule, RouterLink],
  standalone: true,
  styleUrls: ['./random-test.component.css']
})
export class RandomTestComponent implements OnInit {
  flashcards: Flashcard[] = [];
  filteredFlashcards: Flashcard[] = [];
  currentQuestionIndex: number = 0; // Track the index of the current question
  currentQuestion: any = null;
  currentQuestionType: string = '';
  userAnswer: string | null = null;
  options: string[] = [];
  score: number = 0;
  showResult: boolean = false;
  noFlashcards: boolean = false;
  immediateFeedback: string | null = null;
  askedQuestions: Set<number> = new Set(); // Track indexes of asked questions
  totalQuestions: number = 0;    // Track the total number of questions

  constructor(private flashcardService: FlashcardService) { }

  ngOnInit(): void {
    this.flashcardService.getFlashcards().subscribe(flashcards => {
      this.flashcards = flashcards;
      this.filteredFlashcards = this.flashcards.filter(fc => fc.favorite);
      this.totalQuestions = this.filteredFlashcards.length; // Set total questions
      if (this.totalQuestions > 0) {
        this.loadQuestion();
      } else {
        this.noFlashcards = true;
      }
    });
  }

  loadQuestion(): void {
    if (this.askedQuestions.size >= this.totalQuestions) {
      this.showResult = true; // End the test if all questions have been asked
      return;
    }

    let currentIndex;
    do {
      this.currentQuestionIndex = Math.floor(Math.random() * this.filteredFlashcards.length);
      currentIndex = this.currentQuestionIndex;
    } while (this.askedQuestions.has(currentIndex));

    const currentFlashcard = this.filteredFlashcards[currentIndex];
    const questionTypes = ['word-meaning', 'meaning-word'];
    if (currentFlashcard.photo) {
      questionTypes.push('image-word');
    }
    if (currentFlashcard.example) {
      questionTypes.push('example-word');
    }
    this.currentQuestionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    switch (this.currentQuestionType) {
      case 'word-meaning':
        this.currentQuestion = currentFlashcard.word;
        this.options = this.generateOptions(currentFlashcard.meaning, 'meaning');
        break;
      case 'meaning-word':
        this.currentQuestion = currentFlashcard.meaning;
        this.options = this.generateOptions(currentFlashcard.word, 'word');
        break;
      case 'image-word':
        this.currentQuestion = currentFlashcard.photo;
        this.options = this.generateOptions(currentFlashcard.word, 'word');
        break;
      case 'example-word':
        this.currentQuestion = this.createSentenceWithBlank(currentFlashcard.example, currentFlashcard.word);
        break;
      default:
        break;
    }

    this.immediateFeedback = null; // Reset feedback for each new question
    this.askedQuestions.add(currentIndex); // Mark this flashcard index as asked
  }

  createSentenceWithBlank(sentence: string | undefined, word: string): string {
    if (!sentence) return '';
    return sentence.replace(word, '__________');
  }

  generateOptions(correctAnswer: string, type: 'word' | 'meaning'): string[] {
    const options = [correctAnswer];
    const optionsPool = type === 'word' ? this.filteredFlashcards.map(fc => fc.word) : this.filteredFlashcards.map(fc => fc.meaning);

    while (options.length < 4 && optionsPool.length > 1) {
      const randomIndex = Math.floor(Math.random() * optionsPool.length);
      const option = optionsPool[randomIndex];
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
    const correctAnswer = this.currentQuestionType === 'word-meaning'
      ? this.filteredFlashcards[this.currentQuestionIndex].meaning
      : this.filteredFlashcards[this.currentQuestionIndex].word;

    if (this.currentQuestionType === 'example-word' && this.userAnswer) {
      if (this.userAnswer === correctAnswer) {
        this.immediateFeedback = `Correct! "${correctAnswer}" is the right answer.`;
        this.score++;
      } else {
        this.immediateFeedback = `Incorrect. The correct answer is "${correctAnswer}".`;
      }
    } else if (this.userAnswer === correctAnswer) {
      this.immediateFeedback = `Correct! "${correctAnswer}" is the right answer.`;
      this.score++;
    } else {
      this.immediateFeedback = `Incorrect. The correct answer is "${correctAnswer}".`;
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionType !== 'example-word' || this.userAnswer !== null) {
      this.userAnswer = null;
      this.loadQuestion();
    }
  }

  restartTest(): void {
    this.userAnswer = null;
    this.score = 0;
    this.showResult = false;
    this.askedQuestions.clear();
    this.loadQuestion();
  }
}