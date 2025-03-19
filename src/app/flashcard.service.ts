// src/app/flashcard.service.ts
import { Injectable } from '@angular/core';

export interface Flashcard {
  word: string;
  meaning: string;
  example?: string;
  level?: string;
  photo?: string;
  subject: string; // Subject or Deck
}

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  private storageKey = 'flashcards';
  private flashcards: Flashcard[] = [];

  constructor() {
    this.loadFlashcards();
  }

  addFlashcard(flashcard: Flashcard): void {
    this.flashcards.push(flashcard);
    this.saveFlashcards();
  }

  updateFlashcard(index: number, flashcard: Flashcard): void {
    if (index >= 0 && index < this.flashcards.length) {
      this.flashcards[index] = flashcard;
      this.saveFlashcards();
    }
  }

  deleteFlashcard(index: number): void {
    if (index >= 0 && index < this.flashcards.length) {
      this.flashcards.splice(index, 1);
      this.saveFlashcards();
    }
  }

  getFlashcards(): Flashcard[] {
    return this.flashcards;
  }

  saveFlashcards(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.flashcards));
  }

  loadFlashcards(): void {
    const savedFlashcards = localStorage.getItem(this.storageKey);
    if (savedFlashcards) {
      this.flashcards = JSON.parse(savedFlashcards);
    }
  }
}