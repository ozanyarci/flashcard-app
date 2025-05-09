import { Component, HostListener, ViewChild, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FlashcardComponent } from './flashcard/flashcard.component';
import { TestComponent } from './test/test.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlashcardService } from './flashcard.service';
import { AuthService } from './auth.service';
import { CommonModule } from '@angular/common';
import { SentenceTestComponent } from './sentence-test/sentence-test.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { inject } from "@vercel/analytics";
import { Flashcard } from './models/flashcard';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FlashcardComponent,
    TestComponent,
    SentenceTestComponent,
    MatToolbarModule,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger; // Use the non-null assertion operator
  title = 'flashcard-app';
  isMobile = false;
  flashcardCount: number = 0;
  flashcards: Flashcard[] = [];
  displayName: string | null = null;

  constructor(private flashcardService: FlashcardService, private authService: AuthService) {
    this.checkScreenWidth();
    this.flashcardService.getFlashcards().subscribe(flashcards => {
      this.flashcards = flashcards;
      this.flashcardCount = flashcards.length;
    });
    inject();
  }

  ngOnInit() {
    this.authService.getUser().pipe(
      switchMap(user => {
        if (user) {
          return this.authService.getUserDisplayName(user.uid);
        } else {
          return new Observable<string | null>(observer => {
            observer.next(null);
            observer.complete();
          });
        }
      })
    ).subscribe(displayName => {
      this.displayName = displayName;
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  }

  checkScreenWidth() {
    this.isMobile = window.innerWidth < 600;
  }

  toggleMenu() {
    this.menuTrigger.openMenu();
  }

  hasEnoughFlashcards(): boolean {
    return this.flashcardCount >= 4;
  }
}
