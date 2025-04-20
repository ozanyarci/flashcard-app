import { Injectable } from '@angular/core';
import { Flashcard } from './models/flashcard';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private storageKey = 'flashcards';
  private flashcards: Flashcard[] = [];

  constructor() {
    this.loadFlashcards();
  }

  addFlashcard(flashcard: Flashcard): void {
    // Ensure new flashcard has a unique ID (can be timestamp or random string)
    flashcard.id = flashcard.id || this.generateId();
    this.flashcards.push(flashcard);
    this.saveFlashcards();
  }

  updateFlashcard(index: string, flashcard: Flashcard): void {
    const idx = this.flashcards.findIndex(fc => fc.id === index);
    if (idx !== -1) {
      this.flashcards[idx] = flashcard;
      this.saveFlashcards();
    }
  }

  deleteFlashcard(index: string): void {
    this.flashcards = this.flashcards.filter(fc => fc.id !== index);
    this.saveFlashcards();
  }

  getFlashcards(): Flashcard[] {
    return this.flashcards;
  }

  private saveFlashcards(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.flashcards));
  }

  private loadFlashcards(): void {
    const savedFlashcards = localStorage.getItem(this.storageKey);
    if (savedFlashcards) {
      this.flashcards = JSON.parse(savedFlashcards);
    }
  }

  private generateId(): string {
    return '_' + Math.random().toString(36).substr(2, 9);
  }
}
