import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, getDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Flashcard, Creator } from './models/flashcard';
import { Observable, from, of } from 'rxjs';
import { switchMap, map, catchError, concatMap, tap } from 'rxjs/operators';
import { DocumentData, DocumentReference } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(private firestore: Firestore, private authService: AuthService) {}

  getFlashcards(): Observable<Flashcard[]> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        if (user) {
          const flashcardsCollection = collection(this.firestore, `users/${user.uid}/flashcards`);
          return from(getDocs(flashcardsCollection)).pipe(
            map((snapshot) => snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() as Flashcard }))),
            catchError((err) => {
              console.error('Error fetching flashcards:', err);
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

  addFlashcard(flashcard: Flashcard): Observable<DocumentReference<DocumentData>> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        if (user) {
          const flashcardsCollection = collection(this.firestore, `users/${user.uid}/flashcards`);
          return from(addDoc(flashcardsCollection, flashcard)).pipe(
            map((docRef: DocumentReference) => {
              console.log('Flashcard added successfully');
              return docRef;
            }),
            catchError((err) => {
              console.error('Error adding flashcard:', err);
              throw err;
            })
          );
        } else {
          throw new Error('User not authenticated');
        }
      }),
      catchError((err) => {
        console.error('Error fetching user:', err);
        throw err;
      })
    );
  }

  updateFlashcard(id: string, flashcard: Flashcard): Observable<void> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        if (user) {
          const flashcardDoc = doc(this.firestore, `users/${user.uid}/flashcards/${id}`);
          return from(updateDoc(flashcardDoc, { ...flashcard })).pipe(
            map(() => {
              console.log('Flashcard updated successfully');
            }),
            catchError((err) => {
              console.error('Error updating flashcard:', err);
              throw err;
            })
          );
        } else {
          throw new Error('User not authenticated');
        }
      }),
      catchError((err) => {
        console.error('Error fetching user:', err);
        throw err;
      })
    );
  }

  deletePersonalFlashcard(flashcardId: string): Observable<void> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        if (user) {
          const flashcardDoc = doc(this.firestore, `users/${user.uid}/flashcards/${flashcardId}`);
          return from(deleteDoc(flashcardDoc)).pipe(
            catchError((err) => {
              console.error('Error deleting personal flashcard:', err);
              throw err;
            })
          );
        } else {
          throw new Error('User not authenticated');
        }
      }),
      catchError((err) => {
        console.error('Error fetching user:', err);
        throw err;
      })
    );
  }

  deletePublicFlashcard(flashcardId: string): Observable<void> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        if (user) {
          let flashcardDoc = doc(this.firestore, `publicFlashcards/${flashcardId}`);
          return from(getDoc(flashcardDoc)).pipe(
            switchMap((docSnapshot) => {
              if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                if (data && data['createdBy'] === user.uid) {
                  return from(deleteDoc(flashcardDoc)).pipe(
                    tap(() => console.log(`Public flashcard with ID ${flashcardId} deleted successfully.`)),
                    catchError((err) => {
                      console.error('Error deleting public flashcard:', err);
                      throw err;
                    })
                  );
                } else {
                  console.warn('No permission to delete this public flashcard');
                  return of(void 0);
                }
              } else {
                console.warn('Flashcard does not exist');
                return of(void 0);
              }
            }),
            catchError((err) => {
              console.error(`Error fetching public flashcard ${flashcardId}:`, err);
              throw err;
            })
          );
        } else {
          console.error('User not authenticated');
          return of(void 0);
        }
      }),
      catchError((err) => {
        console.error('Error fetching user:', err);
        throw err;
      })
    );
  }

  addPublicFlashcard(flashcard: Flashcard): Observable<void> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        if (user) {
          const publicFlashcardsCollection = collection(this.firestore, 'publicFlashcards');
          flashcard.createdBy = user.uid;
          return from(addDoc(publicFlashcardsCollection, flashcard)).pipe(
            map(() => {
              console.log('Public flashcard added successfully');
            }),
            catchError((err) => {
              console.error('Error adding public flashcard:', err);
              throw err;
            })
          );
        } else {
          throw new Error('User not authenticated');
        }
      }),
      catchError((err) => {
        console.error('Error fetching user:', err);
        throw err;
      })
    );
  }

  getCreator(uid: string): Observable<Creator> {
    console.log(`Fetching creator information for UID: ${uid}`);
    const userDoc = doc(this.firestore, `users/${uid}`);
    return from(getDoc(userDoc)).pipe(
      map((docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const displayName = data ? data['displayName'] : 'Unknown';
          console.log(`Fetched creator: ${displayName}`);
          return { name: displayName };
        } else {
          console.warn(`Creator with UID ${uid} not found`);
          return { name: 'Unknown' };
        }
      }),
      catchError((err) => {
        console.error(`Error fetching creator information for UID ${uid}:`, err);
        return of({ name: 'Unknown' });
      })
    );
  }

  getPublicFlashcards(): Observable<Flashcard[]> {
    const publicFlashcardsCollection = collection(this.firestore, 'publicFlashcards');
    return from(getDocs(publicFlashcardsCollection)).pipe(
      concatMap(snapshot =>
        from(Promise.all(snapshot.docs.map(doc => {
          const data = doc.data() as Flashcard;
          const createdBy = data.createdBy;
          const flashcardWithId = { ...data, id: doc.id };
          if (createdBy) {
            return this.getCreator(createdBy).pipe(
              map(creator => ({ ...flashcardWithId, creator }))
            ).toPromise();
          } else {
            return Promise.resolve({ ...flashcardWithId, creator: { name: 'Unknown' } });
          }
        })))
      ),
      map(flashcards => flashcards.filter(flashcard => flashcard !== undefined) as Flashcard[]),
      catchError(err => {
        console.error('Error fetching public flashcards:', err);
        return of([]);
      })
    );
  }
}
