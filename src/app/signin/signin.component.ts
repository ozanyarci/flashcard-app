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
  constructor(private authService: AuthService, private router: Router) {}
  async signIn() {
    try {
      await this.authService.signIn(this.email, this.password).toPromise();
      this.router.navigate(['/flashcards']);
    } catch (error) {
      alert('Sign-in error');
    }
  }
}
