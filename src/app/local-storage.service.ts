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
    flashcard.id = flashcard.id || this.generateId();
    this.flashcards.push(flashcard);
    this.saveFlashcards();
  }

  updateFlashcard(id: string, flashcard: Flashcard): void {
    const idx = this.flashcards.findIndex(fc => fc.id === id);
    if (idx !== -1) {
      this.flashcards[idx] = flashcard;
      this.saveFlashcards();
    } else {
      console.error(`Flashcard with id ${id} not found for update`);
    }
  }

  deleteFlashcard(id: string): void {
    const initialLength = this.flashcards.length;
    console.log(`Attempting to delete flashcard with id ${id} from local storage`);
    this.flashcards = this.flashcards.filter(fc => fc.id !== id);
    if (this.flashcards.length < initialLength) {
      this.saveFlashcards();
      console.log(`Flashcard with id ${id} deleted successfully`);
    } else {
      console.error(`Flashcard with id ${id} not found for deletion`);
    }
  }

  clearAllFlashcards(): void {
    this.flashcards = [];
    this.saveFlashcards();
    console.log('All flashcards cleared from local storage');
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
