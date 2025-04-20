import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth;

  constructor(private afAuth: Auth) { // Use AngularFire's dependency injection
    this.auth = afAuth;
  }

  getUser(): Observable<User | null> {
    return new Observable((observer) => {
      onAuthStateChanged(this.auth, (user) => {
        observer.next(user);
      }, (error) => observer.error(error));
    });
  }

  signIn(email: string, password: string): Observable<void> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(map(() => {}));
  }

  signUp(email: string, password: string): Observable<void> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(map(() => {}));
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth)).pipe(map(() => {}));
  }
}
