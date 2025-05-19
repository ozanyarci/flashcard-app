import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) {} // Use Angular Fire's dependency injection

  getUser(): Observable<User | null> {
    return new Observable((observer) => {
      onAuthStateChanged(this.auth, (user) => {
        observer.next(user);
      }, (error) => observer.error(error));
    });
  }

  getUserPromise(): Promise<User | null> {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(this.auth, (user) => {
        resolve(user);
      }, (error) => reject(error));
    });
  }

  signIn(email: string, password: string): Observable<{ hasDisplayName: boolean, displayName?: string }> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) => {
        const user = userCredential.user;
        if (user) {
          const userDoc = doc(this.firestore, `users/${user.uid}`);
          return from(getDoc(userDoc)).pipe(
            map((docSnapshot) => {
              if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                const displayName = data ? data['displayName'] : null; // Access with ['displayName']
                if (displayName) {
                  return { hasDisplayName: true, displayName };
                } else {
                  return { hasDisplayName: false };
                }
              } else {
                return { hasDisplayName: false };
              }
            })
          );
        } else {
          throw new Error('User not available after sign-in');
        }
      }),
      catchError((error) => {
        console.error(`Sign-in error: ${error}`);
        throw new Error(`Sign-in error: ${error.message || error}`);
      })
    );
  }

  signUp(email: string, password: string, displayName: string): Observable<void> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) => {
        const user = userCredential.user;
        if (user) {
          const userDoc = doc(this.firestore, `users/${user.uid}`);
          return from(setDoc(userDoc, { displayName })).pipe(
            map(() => {}),
            catchError((error) => {
              console.error(`Error setting displayName in Firestore: ${error}`);
              throw new Error(`Error setting displayName in Firestore: ${error.message || error}`);
            })
          );
        } else {
          throw new Error('User not available after sign-up');
        }
      }),
      catchError((error) => {
        console.error(`Sign-up authentication error: ${error}`);
        throw new Error(`Sign-up authentication error: ${error.message || error}`);
      })
    );
  }

  updateDisplayName(uid: string, displayName: string): Observable<void> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    return from(setDoc(userDoc, { displayName }, { merge: true })).pipe(
      map(() => {}),
      catchError((error) => {
        console.error(`Error updating displayName in Firestore: ${error}`);
        throw new Error(`Error updating displayName in Firestore: ${error.message || error}`);
      })
    );
  }

  getUserDisplayName(uid: string): Observable<string | null> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    return from(getDoc(userDoc)).pipe(
      map((docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          return data ? data['displayName'] : null; // Access with ['displayName']
        } else {
          return null;
        }
      }),
      catchError((error) => {
        console.error(`Error fetching displayName: ${error}`);
        throw new Error(`Error fetching displayName: ${error.message || error}`);
      })
    );
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth)).pipe(map(() => {}));
  }
}
