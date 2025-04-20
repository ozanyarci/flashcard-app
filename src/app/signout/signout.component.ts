import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signout',
  templateUrl: './signout.component.html',
  styleUrls: ['./signout.component.css'],
  standalone:true
})
export class SignoutComponent {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Sign out the user when the component loads
    this.authService.signOut().subscribe(() => {
      this.router.navigate(['/signin']);
    });
  }
}
