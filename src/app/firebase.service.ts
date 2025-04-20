import { Firestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Flashcard } from './models/flashcard';
import { Observable, from, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { DocumentReference } from 'firebase/firestore'; // Ensure correct import from firebase

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(private firestore: Firestore, private authService: AuthService) {}

  getFlashcards(): Observable<Flashcard[]> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        if (user) {
          const flashcardsCollection = collection(
            this.firestore,
            `users/${user.uid}/flashcards`
          );
          // Fetch documents from Firestore and convert to Observable
          return from(getDocs(flashcardsCollection)).pipe(
            map((snapshot) => {
              return snapshot.docs.map((doc) => {
                const data = doc.data() as Flashcard;
                return { id: doc.id, ...data };
              });
            }),
            catchError((err) => {
              console.error(err);
              return of([]); // Return an empty array on error
            })
          );
        } else {
          return of([]);
        }
      }),
      catchError((err) => {
        console.error('Error in getFlashcards:', err);
        return of([]); // Provide a fallback observable
      })
    );
  }

  addFlashcard(flashcard: Flashcard): Observable<DocumentReference> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        if (user) {
          const flashcardsCollection = collection(
            this.firestore,
            `users/${user.uid}/flashcards`
          );
          return from(addDoc(flashcardsCollection, flashcard));
        } else {
          throw new Error('User not authenticated');
        }
      }),
      catchError((err) => {
        console.error(err);
        throw err;
      })
    );
  }

  updateFlashcard(id: string, flashcard: Flashcard): Observable<void> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        if (user) {
          console.log(`Updating flashcard for user: ${user.uid}, document ID: ${id}`);
          const flashcardDoc = doc(
            this.firestore,
            `users/${user.uid}/flashcards/${id}`
          );
          return from(updateDoc(flashcardDoc, { ...flashcard }));
        } else {
          throw new Error('User not authenticated');
        }
      }),
      catchError((err) => {
        console.error('Error updating flashcard:', err);
        throw err;
      })
    );
  }

  deleteFlashcard(id: string): Observable<void> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        if (user) {
          const flashcardDoc = doc(
            this.firestore,
            `users/${user.uid}/flashcards/${id}`
          );
          return from(deleteDoc(flashcardDoc));
        } else {
          throw new Error('User not authenticated');
        }
      }),
      catchError((err) => {
        console.error(err);
        throw err;
      })
    );
  }
}
