// src/app/flashcard/flashcard.component.ts

import { Component } from '@angular/core';
import { FlashcardService } from '../flashcard.service';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-flashcard',
  imports: [CommonModule,MatInputModule,MatButtonModule,MatCardModule,MatToolbarModule,FormsModule,MatIconModule],
  standalone:true,
  templateUrl: './flashcard.component.html',
  styleUrls: ['./flashcard.component.css']
})
export class FlashcardComponent {
  newWord: string = '';
  newMeaning: string = '';
  editMode: boolean = false;
  currentEditIndex: number | null = null;
  flashcards: { word: string, meaning: string }[] = [];
  currentFlashcardIndex: number = 0;
  isFlipped: boolean = false;

  constructor(private flashcardService: FlashcardService) { }

  addOrUpdateFlashcard() {
    if (this.newWord && this.newMeaning) {
      if (this.editMode && this.currentEditIndex !== null) {
        this.flashcardService.updateFlashcard(this.currentEditIndex, this.newWord, this.newMeaning);
        this.editMode = false;
        this.currentEditIndex = null;
      } else {
        this.flashcardService.addFlashcard(this.newWord, this.newMeaning);
      }
      this.newWord = '';
      this.newMeaning = '';
      this.loadFlashcards();
      this.currentFlashcardIndex = this.flashcards.length - 1; // Show the newly added or updated flashcard
      this.isFlipped = false; // Reset flip status when new card is added
    }
  }

  editFlashcard(index: number) {
    const flashcard = this.flashcards[index];
    this.newWord = flashcard.word;
    this.newMeaning = flashcard.meaning;
    this.editMode = true;
    this.currentEditIndex = index;
  }

  deleteFlashcard(index: number) {
    this.flashcardService.deleteFlashcard(index);
    this.loadFlashcards();
    if (this.currentFlashcardIndex >= this.flashcards.length) {
      this.currentFlashcardIndex = this.flashcards.length - 1;
    }
    this.isFlipped = false; // Reset flip status when card is deleted
  }

  loadFlashcards() {
    this.flashcards = this.flashcardService.getFlashcards();
  }

  nextFlashcard() {
    if (this.currentFlashcardIndex < this.flashcards.length - 1) {
      this.currentFlashcardIndex++;
      this.isFlipped = false; // Reset flip status when new card is shown
    }
  }

  previousFlashcard() {
    if (this.currentFlashcardIndex > 0) {
      this.currentFlashcardIndex--;
      this.isFlipped = false; // Reset flip status when new card is shown
    }
  }

  flipCard() {
    this.isFlipped = !this.isFlipped;
  }

  ngOnInit() {
    this.loadFlashcards();
  }
}
