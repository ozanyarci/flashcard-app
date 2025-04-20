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
    ).subscribe();
  }

  updateFlashcard(id: string, flashcard: Flashcard): void {
    this.firebaseService.updateFlashcard(id, flashcard).pipe(
      catchError((err) => {
        console.error(err);
        return of(void 0);
      })
    ).subscribe();
  }

  deleteFlashcard(id: string): void {
    this.firebaseService.deleteFlashcard(id).pipe(
      catchError((err) => {
        console.error(err);
        return of(void 0);
      })
    ).subscribe();
  }

  // Helper method to merge two arrays of flashcards while removing duplicates
  private mergeFlashcards(source1: Flashcard[], source2: Flashcard[]): Flashcard[] {
    const seen = new Set();
    const merged = [...source1, ...source2].filter(flashcard => {
      const duplicate = seen.has(flashcard.word);
      seen.add(flashcard.word); // Assuming `word` is unique, you can change this to any unique field
      return !duplicate;
    });
    return merged;
  }
}
