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
  newExample: string = ''; // Optional example sentence
  editMode: boolean = false;
  currentEditIndex: number | null = null;
  flashcards: { word: string, meaning: string, example?: string }[] = [];
  currentFlashcardIndex: number = 0;
  isFlipped: boolean = false;
  currentIndex: number | null = null; // Add new variable to hold current index

  constructor(private flashcardService: FlashcardService) { }

  addOrUpdateFlashcard() {
    if (this.newWord.trim() && this.newMeaning.trim()) {
      if (this.editMode && this.currentEditIndex !== null) {
        this.flashcardService.updateFlashcard(this.currentEditIndex, this.newWord.trim(), this.newMeaning.trim(), this.newExample.trim());
        this.editMode = false;
        this.currentEditIndex = null;
        this.currentIndex = null;
      } else {
        this.flashcardService.addFlashcard(this.newWord.trim(), this.newMeaning.trim(), this.newExample.trim());
        this.currentIndex = this.flashcards.length;
      }
      this.newWord = '';
      this.newMeaning = '';
      this.newExample = ''; // Reset example input
      this.loadFlashcards();
      this.viewUpdatedCard();
      this.isFlipped = false; // Reset flip status when new card is added or updated
    } else {
      alert("Both Word and Meaning fields are required.");
    }
  }

  editFlashcard(index: number) {
    const flashcard = this.flashcards[index];
    this.newWord = flashcard.word;
    this.newMeaning = flashcard.meaning;
    this.newExample = flashcard.example || ''; // Populate example if available
    this.editMode = true;
    this.currentEditIndex = index;
    this.currentFlashcardIndex = index; // Show the flashcard being edited
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

  viewUpdatedCard() {
    if (this.currentIndex !== null && this.currentIndex < this.flashcards.length) {
      this.currentFlashcardIndex = this.currentIndex;
    }
  }

  ngOnInit() {
    this.loadFlashcards();
  }
}
