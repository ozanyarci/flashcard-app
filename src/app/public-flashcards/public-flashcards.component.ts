import { Component, OnInit } from '@angular/core';
import { FlashcardService } from '../flashcard.service';
import { AuthService } from '../auth.service';
import { Flashcard } from '../models/flashcard';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { NgFor, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-public-flashcards',
  templateUrl: './public-flashcards.component.html',
  styleUrls: ['./public-flashcards.component.css'],
  standalone: true,
  imports: [NgFor, MatCardModule, NgIf, MatIconModule, MatButtonModule]
})
export class PublicFlashcardsComponent implements OnInit {
  publicFlashcardsByCreator: { [creatorId: string]: Flashcard[] } = {}; // Explicitly define the type
  currentUserUid: string | null = null;

  constructor(private flashcardService: FlashcardService, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUser().pipe(
      switchMap(user => {
        if (user) {
          this.currentUserUid = user.uid;
        }
        return this.flashcardService.getPublicFlashcards();
      })
    ).subscribe((flashcards) => {
      this.groupFlashcardsByCreator(flashcards);
    });
  }

  groupFlashcardsByCreator(flashcards: Flashcard[]): void {
    this.publicFlashcardsByCreator = flashcards.reduce<{ [creatorId: string]: Flashcard[] }>((decks, flashcard) => {
      const creator: string = flashcard.createdBy || 'Unknown'; // Handle undefined createdBy
      if (!decks[creator]) {
        decks[creator] = [];
      }
      decks[creator].push(flashcard);
      return decks;
    }, {});
  }

  getCreatorKeys(): string[] {
    return Object.keys(this.publicFlashcardsByCreator);
  }

  deleteAllFlashcardsByCreator(creatorId: string) {
    const flashcardIds = this.publicFlashcardsByCreator[creatorId]?.map(flashcard => flashcard.id).filter(id => id !== undefined);
    if (flashcardIds && flashcardIds.length > 0) {
      flashcardIds.forEach(flashcardId => {
        if (flashcardId) {
          this.flashcardService.deleteFlashcard(flashcardId, true).subscribe(() => {
            this.loadPublicFlashcards(); // Refresh the list to confirm deletion
          }, error => {
            console.error(`Error deleting flashcard with ID: ${flashcardId}`, error);
          });
        }
      });
    }
  }

  loadPublicFlashcards() {
    this.flashcardService.getPublicFlashcards().subscribe((flashcards) => {
      this.groupFlashcardsByCreator(flashcards);
    });
  }
}
