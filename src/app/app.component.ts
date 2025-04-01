import { Component, HostListener, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FlashcardComponent } from './flashcard/flashcard.component';
import { TestComponent } from './test/test.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlashcardService } from './flashcard.service';
import { CommonModule } from '@angular/common';
import { SentenceTestComponent } from './sentence-test/sentence-test.component';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,FlashcardComponent,TestComponent,SentenceTestComponent, MatToolbarModule, RouterLink, RouterLinkActive,CommonModule,MatIconModule,MatMenuModule,MatMenuTrigger],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger; // Use the non-null assertion operator
  title = 'flashcard-app';
  isMobile = false;

  constructor(private flashcardService: FlashcardService) {
    this.checkScreenWidth();
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
    return this.flashcardService.getFlashcards().length >= 4;
  }
}
