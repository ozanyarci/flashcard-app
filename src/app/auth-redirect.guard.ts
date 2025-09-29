import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthRedirectGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.getUser().pipe(
      map(user => {
        if (user) {
          this.router.navigate(['/flashcards']); // ✅ logged in → go to flashcards
          return false; // stop navigation to signin
        }
        return true; // no user → allow signin/signup
      })
    );
  }
}
