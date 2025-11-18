import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, CommonModule],
  template: `
    <mat-card>
      <h2>Email Verification Required</h2>
      <p>Please check your inbox and click the verification link we sent you.</p>
      <button mat-raised-button color="primary" (click)="checkVerification()">I Verified My Email</button>
    </mat-card>
  `,
  styles: [`
    mat-card { max-width: 400px; margin: 100px auto; text-align: center; padding: 20px; }
    button { margin-top: 20px; width: 100%; }
  `]
})
export class VerifyEmailComponent {
  constructor(private authService: AuthService, private router: Router) {}

  async checkVerification() {
    const verified = await this.authService.isEmailVerified();
    if (verified) {
      alert('Your email is verified! You can now log in.');
      this.router.navigate(['/signin']);
    } else {
      alert('Your email is not verified yet. Please check your inbox.');
    }
  }
}
