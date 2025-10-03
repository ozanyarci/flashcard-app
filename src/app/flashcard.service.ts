import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { LocalStorageService } from './local-storage.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Flashcard } from './models/flashcard';
import { DocumentReference, DocumentData } from '@angular/fire/firestore';
import { Subject } from './models/subject';

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

  addFlashcard(flashcard: Flashcard): Observable<Flashcard> {
    return this.firebaseService.addFlashcard(flashcard).pipe(
      catchError((err) => {
        console.error('Error adding flashcard:', err);
        return of(); // fallback
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

  getSubjects(): Observable<Subject[]> {
  const defaultSubjects: Subject[] = [
    { name: 'English' },
    { name: 'German' },
    { name: 'French' },
    { name: 'Other' }
  ];

  return this.firebaseService.getSubjects().pipe(
    map(fetchedSubjects => {
      // 🔹 fetchedSubjects already has { id, name }
      // 🔹 merge with defaults, avoiding duplicates
      const allSubjects = [...defaultSubjects];

      fetchedSubjects.forEach(fs => {
        if (!allSubjects.some(ds => ds.name === fs.name)) {
          allSubjects.push(fs);
        }
      });

      return allSubjects;
    }),
    catchError(err => {
      console.error('Error fetching subjects from Firebase:', err);
      return of(defaultSubjects); // fallback to defaults
    })
  );
}

  addSubject(subject: string): Observable<void> {
    return this.firebaseService.addSubject(subject).pipe(
      catchError((err) => {
        console.error('Error adding subject to Firebase:', err);
        return of(void 0);
      })
    );
  }

  deleteSubject(subjectId: string): Observable<void> {
    return this.firebaseService.deleteSubject(subjectId);
  }

  private mistakes: Flashcard[] = [];

  setMistakes(mistakes: Flashcard[]) {
    this.mistakes = mistakes;
  }

  getMistakes(): Flashcard[] {
    return this.mistakes;
  }
}
