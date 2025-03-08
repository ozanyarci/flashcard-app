// src/app/flashcard/flashcard.component.ts

import { Component } from '@angular/core';
import { FlashcardService } from '../flashcard.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-flashcard',
  imports: [CommonModule,MatInputModule,MatButtonModule,MatCardModule,MatToolbarModule,FormsModule,MatIconModule,MatSelectModule,MatFormFieldModule],
  standalone:true,
  templateUrl: './flashcard.component.html',
  styleUrls: ['./flashcard.component.css']
})
export class FlashcardComponent {
  newWord: string = '';
  newMeaning: string = '';
  newExample: string = ''; // Optional example sentence
  newLevel: string = 'Other'; // Optional word level, default to 'Other'
  filterLevel: string = 'All'; // Level filter, default to 'All'
  editMode: boolean = false;
  currentEditIndex: number | null = null;
  allFlashcards: { word: string, meaning: string, example?: string, level?: string }[] = [];
  flashcards: { word: string, meaning: string, example?: string, level?: string }[] = [];
  currentFlashcardIndex: number = 0;
  isFlipped: boolean = false;
  currentIndex: number | null = null; // Add new variable to hold current index

  levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Other']; // Levels options
  filterLevels = ['All', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Other'];

  constructor(private flashcardService: FlashcardService) { }

  addOrUpdateFlashcard() {
    if (this.newWord.trim() && this.newMeaning.trim()) {
      if (this.editMode && this.currentEditIndex !== null) {
        this.flashcardService.updateFlashcard(this.currentEditIndex, this.newWord.trim(), this.newMeaning.trim(), this.newExample.trim(), this.newLevel);
        this.editMode = false;
        this.currentEditIndex = null;
        this.currentIndex = null;
      } else {
        this.flashcardService.addFlashcard(this.newWord.trim(), this.newMeaning.trim(), this.newExample.trim(), this.newLevel);
        this.currentIndex = this.allFlashcards.length;
      }
      this.newWord = '';
      this.newMeaning = '';
      this.newExample = ''; // Reset example input
      this.newLevel = 'Other'; // Reset level input
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
    this.newLevel = flashcard.level || 'Other'; // Populate level if available
    this.editMode = true;
    this.currentEditIndex = index;
    this.currentFlashcardIndex = index; // Show the flashcard being edited
  }

  deleteFlashcard(index: number) {
    this.flashcardService.deleteFlashcard(index);
    this.loadFlashcards();
    if (this.currentFlashcardIndex >= this.flashcards.length) {
      this.currentFlashcardIndex = this.flashcards.length ? this.flashcards.length - 1 : 0;
    }
    this.isFlipped = false; // Reset flip status when card is deleted
  }

  loadFlashcards() {
    this.allFlashcards = this.flashcardService.getFlashcards();
    this.applyFilter();
  }

  applyFilter() {
    if (this.filterLevel === 'All') {
      this.flashcards = this.allFlashcards;
    } else {
      this.flashcards = this.allFlashcards.filter(flashcard => flashcard.level === this.filterLevel);
    }
    // Reset currentFlashcardIndex if filtered out
    if (this.currentFlashcardIndex >= this.flashcards.length) {
      this.currentFlashcardIndex = this.flashcards.length ? this.flashcards.length - 1 : 0;
    }
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
