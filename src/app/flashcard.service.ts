// src/app/flashcard.service.ts

import { Injectable } from '@angular/core';

export interface Flashcard {
  word: string;
  meaning: string;
}

@Injectable({
  providedIn: 'root',
})
export class FlashcardService {
  private flashcards: Flashcard[] = [];
  private storageKey = 'flashcards';

  constructor() {
    this.loadFlashcards();
  }

  addFlashcard(word: string, meaning: string): void {
    this.flashcards.push({ word, meaning });
    this.saveFlashcards();
  }

  updateFlashcard(index: number, word: string, meaning: string): void {
    if (index >= 0 && index < this.flashcards.length) {
      this.flashcards[index] = { word, meaning };
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
