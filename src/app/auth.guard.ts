import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of, from } from 'rxjs';
import { map, switchMap, catchError, take } from 'rxjs/operators';
import { reload } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private prompted = false;

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.getUser().pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/signin']);
          return of(false);
        }

        return from(reload(user)).pipe(
          switchMap(() => {
            if (user.emailVerified) return of(true);

            if (!this.prompted) {
              this.prompted = true;
              const resend = confirm('Your email is not verified. Resend verification email?');
              if (resend) {
                this.authService.resendVerificationEmail();
                alert('Verification email sent. Please check your inbox.');
              }
            }

            this.router.navigate(['/verify-email']);
            return of(false);
          })
        );
      }),
      catchError(() => {
        this.router.navigate(['/signin']);
        return of(false);
      })
    );
  }
}
