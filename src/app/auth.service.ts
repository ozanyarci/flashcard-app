import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendEmailVerification,
  updateProfile,
  reload,
  applyActionCode,
  getAuth,
  ActionCodeSettings,
  sendSignInLinkToEmail,
  UserCredential
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  // 🔹 Watch auth state
    getUser(): Observable<any> {
    return new Observable(subscriber => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => subscriber.next(user));
      return unsubscribe;
    });
  }


  // 🔹 Promise-based version (for guards)
  async getUserPromise() {
    return new Promise<any>((resolve) => {
      const unsub = onAuthStateChanged(this.auth, (user) => {
        unsub();
        resolve(user);
      });
    });
  }

  // 🔹 Sign In (email + password)
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      console.error('Sign-in error:', error.code, error.message);
      throw error;
    }
  }

  // 🔹 Sign Up + Email Verification
  signUp(email: string, password: string, displayName: string): Observable<void> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(async (userCredential) => {
        const user = userCredential.user;
        if (!user) throw new Error('User not available after sign-up');

        await updateProfile(user, { displayName });

        // Save to Firestore
        const userDoc = doc(this.firestore, `users/${user.uid}`);
        await setDoc(userDoc, { displayName });

        // Send verification email
        await sendEmailVerification(user);
        console.log('Verification email sent to:', user.email);
      }),
      catchError((error) => {
        console.error('Sign-up error:', error);
        throw new Error(`Sign-up error: ${error.message || error}`);
      })
    );
  }

  // 🔹 Update display name
  async updateDisplayName(uid: string, displayName: string): Promise<void> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    await updateDoc(userDoc, { displayName });
  }

  // 🔹 Get display name
  getUserDisplayName(uid: string): Observable<string | null> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    return from(getDoc(userDoc)).pipe(
      map((docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          return data ? data['displayName'] : null;
        } else {
          return null;
        }
      }),
      catchError((error) => {
        console.error('Error fetching displayName:', error);
        throw new Error(`Error fetching displayName: ${error.message || error}`);
      })
    );
  }

  // 🔹 Sign Out
  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }

  // 🔹 Check if email verified
  async isEmailVerified(): Promise<boolean> {
    const user = this.auth.currentUser;
    await user?.reload();
    return !!user?.emailVerified;
  }

  // 🔹 Resend verification email
  async resendVerificationEmail(): Promise<void> {
    if (this.auth.currentUser) {
      await sendEmailVerification(this.auth.currentUser);
    } else {
      throw new Error('No user signed in.');
    }
  }

  async hasDisplayName(uid: string): Promise<boolean> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    const snap = await getDoc(userDoc);
    return snap.exists() && !!snap.data()?.['displayName'];
  }


  // ✅ Add this missing method:
  async applyEmailVerificationCode(oobCode: string): Promise<void> {
    return applyActionCode(this.auth, oobCode);
  }

}
