import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule, MatInputModule, MatButtonModule, MatCardModule, MatFormFieldModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  email: string = '';
  password: string = '';
  constructor(private authService: AuthService, private router: Router) {}

  async signUp() {
    try {
      await this.authService.signUp(this.email, this.password).toPromise();
      this.router.navigate(['/flashcards']);
    } catch (error) {
      alert('Sign-up error');
    }
  }
}
