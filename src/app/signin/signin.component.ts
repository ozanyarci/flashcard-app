import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
  ],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent {
  email: string = '';
  password: string = '';
  displayName: string = '';
  displayNameRequired: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  async signIn() {
    try {

      if (!this.email || !this.password) {
        throw new Error('Email and password are required.');
      }

      // ✅ use password-based sign-in only
      const credential = await this.authService.signIn(this.email, this.password);

      if (!credential || !credential.user) {
        alert('Sign-in failed.');
        return;
      }

      const user = credential.user;

      // ✅ allow sign-in even if not verified
      if (!user.emailVerified) {
        const resend = confirm('Your email is not verified. Resend verification email?');
        if (resend) {
          await this.authService.resendVerificationEmail();
          alert('Verification link sent to your email. Please click it to verify.');
        }
      }

      // ✅ check if user has displayName in Firestore (optional)
      const hasDisplayName = await this.authService.hasDisplayName(user.uid);
      if (hasDisplayName) {
        this.router.navigate(['/flashcards']);
      } else {
        this.displayNameRequired = true;
      }
    } catch (error: any) {
      console.error('Sign-in error', error);
      alert('Sign-in error: ' + (error?.message || 'Unknown error'));
    }
  }

  async saveDisplayName() {
    try {
      const user = await this.authService.getUserPromise();
      if (user) {
        await this.authService.updateDisplayName(user.uid, this.displayName);
        this.router.navigate(['/flashcards']);
      }
    } catch (error: any) {
      console.error('Error saving display name', error);
      alert('Error saving display name: ' + (error?.message || 'Unknown error'));
    }
  }

  async sendVerificationEmail() {
    try {
      const user = await this.authService.getUserPromise();
      if (!user) {
        alert('Please sign in first.');
        return;
      }
      if (user.emailVerified) {
        alert('Already verified!');
        return;
      }

      await this.authService.resendVerificationEmail();
      alert('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      alert('Error sending verification email: ' + (error?.message || 'Unknown error'));
    }
  }
}
