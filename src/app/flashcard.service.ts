import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { LocalStorageService } from './local-storage.service';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Flashcard } from './models/flashcard';
import { DocumentReference, DocumentData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  constructor(private firebaseService: FirebaseService, private localStorageService: LocalStorageService) {}

  getFlashcards(): Observable<Flashcard[]> {
    return this.firebaseService.getFlashcards().pipe(
      // additional logic if needed
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

  deleteFlashcard(id: string, isPublic: boolean = false): Observable<void> {
    return this.firebaseService.deleteFlashcard(id, isPublic).pipe(
      catchError((err) => {
        console.error('Error deleting flashcard:', err);
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
