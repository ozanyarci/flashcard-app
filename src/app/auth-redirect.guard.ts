import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthRedirectGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.getUser().pipe(
      take(1), // ✅ Ensures it runs once, prevents loops
      tap((user: User | null) => {
        if (user) {
          // ✅ Navigation happens *after* guard finishes
          setTimeout(() => this.router.navigate(['/flashcards']), 0);
        }
      }),
      map(user => !user) // ✅ allow navigation only if NOT signed in
    );
  }
}
