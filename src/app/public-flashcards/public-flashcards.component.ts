import { Component, OnInit } from '@angular/core';
import { FlashcardService } from '../flashcard.service';
import { AuthService } from '../auth.service';
import { Flashcard } from '../models/flashcard';
import { forkJoin, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
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
  publicFlashcardsByCreator: { [creatorId: string]: Flashcard[] } = {};
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

    console.log('PublicFlashcardsComponent initialized.');
  }

  groupFlashcardsByCreator(flashcards: Flashcard[]): void {
    this.publicFlashcardsByCreator = flashcards.reduce<{ [creatorId: string]: Flashcard[] }>((decks, flashcard) => {
      const creator: string = flashcard.createdBy || 'Unknown';
      if (!decks[creator]) {
        decks[creator] = [];
      }
      decks[creator].push(flashcard);
      return decks;
    }, {});

    console.log('Flashcards have been grouped by creator:', this.publicFlashcardsByCreator);
  }

  getCreatorKeys(): string[] {
    return Object.keys(this.publicFlashcardsByCreator);
  }

  deleteAllFlashcardsByCreator(creatorId: string) {
    const flashcardIds = this.publicFlashcardsByCreator[creatorId]?.map(flashcard => flashcard.id).filter(id => id !== undefined);
    if (flashcardIds && flashcardIds.length > 0) {
      console.log(`Deleting flashcards for creator ID: ${creatorId}`);
      const deleteObservables: Observable<void>[] = flashcardIds.map(flashcardId => {
        console.log(`Attempting to delete flashcard with ID: ${flashcardId}`);
        return this.flashcardService.deleteFlashcard(flashcardId).pipe(
          tap({
            next: () => {
              console.log(`Flashcard with ID ${flashcardId} deleted successfully.`);
              this.loadPublicFlashcards();
            },
            error: (error) => console.error(`Error deleting flashcard with ID ${flashcardId}:`, error),
          })
        );
      });

      forkJoin(deleteObservables).pipe(
        tap({
          next: () => {
            console.log('All flashcards by this creator have been deleted successfully.');
            this.loadPublicFlashcards();
            alert('All flashcards by this creator have been deleted successfully.');
          },
          error: (error) => {
            console.error('Error deleting flashcards:', error);
            alert('Error deleting flashcards.');
          }
        })
      ).subscribe({
        next: () => console.log('forkJoin completed successfully.'),
        error: (error) => console.error('Error occurred in forkJoin:', error),
        complete: () => console.log('forkJoin completed')
      });
    } else {
      console.log('No flashcards to delete for creator ID:', creatorId);
    }
  }

  loadPublicFlashcards() {
    this.publicFlashcardsByCreator = {};
    this.flashcardService.getPublicFlashcards().subscribe((flashcards) => {
      this.groupFlashcardsByCreator(flashcards);
    });
  }
}
