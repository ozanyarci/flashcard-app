import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { LocalStorageService } from './local-storage.service';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { Flashcard } from './models/flashcard';

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  constructor(private firebaseService: FirebaseService, private localStorageService: LocalStorageService) {}

  getFlashcards(): Observable<Flashcard[]> {
    return this.firebaseService.getFlashcards().pipe(
      switchMap(firestoreFlashcards => {
        const localFlashcards = this.localStorageService.getFlashcards();
        const combinedFlashcards = this.mergeFlashcards(firestoreFlashcards, localFlashcards);
        return of(combinedFlashcards);
      }),
      catchError((err) => {
        console.error('Error fetching flashcards from Firebase:', err);
        return of(this.localStorageService.getFlashcards());
      })
    );
  }

  addFlashcard(flashcard: Flashcard): void {
    this.firebaseService.addFlashcard(flashcard).pipe(
      catchError((err) => {
        console.error(err);
        this.localStorageService.addFlashcard(flashcard);
        return of();
      })
    ).subscribe(() => {
      // Optionally, re-sync local storage after successful Firebase operation
    });
  }

  updateFlashcard(id: string, flashcard: Flashcard): void {
    this.firebaseService.updateFlashcard(id, flashcard).pipe(
      catchError((err) => {
        console.error(err);
        this.localStorageService.updateFlashcard(id, flashcard);
        return of(void 0);
      })
    ).subscribe(() => {
      // Optionally, re-sync local storage after successful Firebase operation
      console.log(`Flashcard with id ${id} updated successfully`);
    });
  }

  deleteFlashcard(id: string): void {
    this.firebaseService.deleteFlashcard(id).pipe(
      catchError((err) => {
        console.error(err);
        this.localStorageService.deleteFlashcard(id);
        return of(void 0);
      })
    ).subscribe(() => {
      // Optionally, re-sync local storage after successful Firebase operation
      console.log(`Flashcard with id ${id} deleted successfully`);
      this.localStorageService.deleteFlashcard(id); // Ensure local storage sync if Firebase is successful
    });
  }

  // Helper method to merge two arrays of flashcards while removing duplicates
  private mergeFlashcards(source1: Flashcard[], source2: Flashcard[]): Flashcard[] {
    const seen = new Set();
    const merged = [...source1, ...source2].filter(flashcard => {
      const key = flashcard.id; // Use id as unique identifier
      if (!seen.has(key)) {
        seen.add(key);
        return true;
      }
      return false;
    });
    return merged;
  }
}
