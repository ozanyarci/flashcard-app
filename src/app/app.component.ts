import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FlashcardComponent } from './flashcard/flashcard.component';
import { TestComponent } from './test/test.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlashcardService } from './flashcard.service';
import { CommonModule } from '@angular/common';
import { SentenceTestComponent } from './sentence-test/sentence-test.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,FlashcardComponent,TestComponent,SentenceTestComponent, MatToolbarModule, RouterLink, RouterLinkActive,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'flashcard-app';

  constructor(private flashcardService: FlashcardService) { }

  hasEnoughFlashcards(): boolean {
    return this.flashcardService.getFlashcards().length >= 4;
  }
}
