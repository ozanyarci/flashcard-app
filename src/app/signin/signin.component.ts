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
  imports: [FormsModule, RouterLink, CommonModule, MatInputModule, MatButtonModule, MatCardModule, MatFormFieldModule],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  email: string = '';
  password: string = '';
  displayName: string = '';
  displayNameRequired: boolean = false;
  constructor(private authService: AuthService, private router: Router) {}

  async signIn() {
    try {
      const result = await this.authService.signIn(this.email, this.password).toPromise();
      if (result && result.hasDisplayName) {
        const displayName = result.displayName ?? 'User';
        this.router.navigate(['/home'], { state: { displayName } });
      } else {
        this.displayNameRequired = true;
      }
    } catch (error) {
      // Handle error with type assertion
      console.error('Sign-in error', error);
      if (error instanceof Error) {
        alert('Sign-in error: ' + error.message);
      } else {
        alert('Sign-in error: Unknown error occurred');
      }
    }
  }

  async saveDisplayName() {
    try {
      const user = await this.authService.getUser().toPromise();
      if (user) {
        await this.authService.updateDisplayName(user.uid, this.displayName).toPromise();
        this.router.navigate(['/home'], { state: { displayName: this.displayName } });
      }
    } catch (error) {
      console.error('Error saving display name', error);
      if (error instanceof Error) {
        alert('Error saving display name: ' + error.message);
      } else {
        alert('Error saving display name: Unknown error occurred');
      }
    }
  }
}
