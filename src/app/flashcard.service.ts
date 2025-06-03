import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { LocalStorageService } from './local-storage.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Flashcard } from './models/flashcard';
import { DocumentReference, DocumentData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  constructor(private firebaseService: FirebaseService, private localStorageService: LocalStorageService) {}

  getFlashcards(): Observable<Flashcard[]> {
    return this.firebaseService.getFlashcards().pipe(
      catchError((err) => {
        console.error('Error fetching flashcards from Firebase:', err);
        return of(this.localStorageService.getFlashcards());
      })
    );
  }

  addFlashcard(flashcard: Flashcard): Observable<DocumentReference<DocumentData>> {
    return this.firebaseService.addFlashcard(flashcard).pipe(
      catchError((err) => {
        console.error('Error adding flashcard:', err);
        return of(); // Return empty observable
      })
    );
  }

  updateFlashcard(id: string, flashcard: Flashcard): Observable<void> {
    return this.firebaseService.updateFlashcard(id, flashcard).pipe(
      catchError((err) => {
        console.error('Error updating flashcard:', err);
        return of(void 0);
      })
    );
  }

  deletePersonalFlashcard(id: string): Observable<void> {
    return this.firebaseService.deletePersonalFlashcard(id).pipe(
      catchError((err) => {
        console.error('Error deleting personal flashcard:', err);
        return of(void 0);
      })
    );
  }

  deletePublicFlashcard(flashcardId: string): Observable<void> {
    return this.firebaseService.deletePublicFlashcard(flashcardId).pipe(
      catchError((err) => {
        console.error('Error deleting public flashcard:', err);
        return of(void 0);
      })
    );
  }

  addPublicFlashcard(flashcard: Flashcard): Observable<void> {
    return this.firebaseService.addPublicFlashcard(flashcard).pipe(
      catchError((err) => {
        console.error('Error adding public flashcard:', err);
        return of(void 0);
      })
    );
  }

  getPublicFlashcards(): Observable<Flashcard[]> {
    return this.firebaseService.getPublicFlashcards().pipe(
      catchError((err) => {
        console.error('Error fetching public flashcards:', err);
        return of([]);
      })
    );
  }
}
