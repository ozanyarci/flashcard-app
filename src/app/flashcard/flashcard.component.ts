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
  newPhoto: string | ArrayBuffer | null = null; // Optional photo stored as a Base64 string
  filterLevel: string = 'All'; // Level filter, default to 'All'
  editMode: boolean = false;
  currentEditIndex: number | null = null;
  allFlashcards: { word: string, meaning: string, example?: string, level?: string, photo?: string }[] = [];
  flashcards: { word: string, meaning: string, example?: string, level?: string, photo?: string }[] = [];
  currentFlashcardIndex: number = 0;
  isFlipped: boolean = false;
  currentIndex: number | null = null; // Add new variable to hold current index
  levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Other']; // Levels options
  filterLevels = ['All', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Other'];

  constructor(private flashcardService: FlashcardService) {}

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('The file size exceeds the 5MB limit.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.newPhoto = e.target?.result || null; // Ensure `null` if result is undefined
      };
      reader.readAsDataURL(file);
    }
  }

  addOrUpdateFlashcard() {
    if (this.newWord.trim() && this.newMeaning.trim()) {
      if (this.editMode && this.currentEditIndex !== null) {
        this.flashcardService.updateFlashcard(
          this.currentEditIndex,
          this.newWord.trim(),
          this.newMeaning.trim(),
          this.newExample.trim(),
          this.newLevel,
          this.newPhoto?.toString()
        );
        this.editMode = false;
        this.currentEditIndex = null;
        this.currentIndex = null;
        alert('Flashcard updated successfully.');
      } else {
        this.flashcardService.addFlashcard(
          this.newWord.trim(),
          this.newMeaning.trim(),
          this.newExample.trim(),
          this.newLevel,
          this.newPhoto?.toString()
        );
        this.currentIndex = this.allFlashcards.length;
        alert('Flashcard added successfully.');
      }
      this.resetForm();
      this.loadFlashcards();
      this.viewUpdatedCard();
      this.isFlipped = false;
    } else {
      alert('Both Word and Meaning fields are required.');
    }
  }

  editFlashcard(index: number) {
    const flashcard = this.flashcards[index];
    this.newWord = flashcard.word;
    this.newMeaning = flashcard.meaning;
    this.newExample = flashcard.example || ''; // Populate example if available
    this.newLevel = flashcard.level || 'Other'; // Populate level if available
    this.newPhoto = flashcard.photo || null; // Populate photo if available
    this.editMode = true;
    this.currentEditIndex = index;
    this.currentFlashcardIndex = index; // Show the flashcard being edited
  }

  deleteFlashcard(index: number) {
    this.flashcardService.deleteFlashcard(index);
    this.loadFlashcards();
    alert('Flashcard deleted successfully.');
    if (this.currentFlashcardIndex >= this.flashcards.length) {
      this.currentFlashcardIndex = this.flashcards.length ? this.flashcards.length - 1 : 0;
    }
    this.isFlipped = false;
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

  resetForm() {
    this.newWord = '';
    this.newMeaning = '';
    this.newExample = '';
    this.newLevel = 'Other';
    this.newPhoto = null;
    this.editMode = false;
    this.currentEditIndex = null;
    this.currentIndex = null;
  }

  ngOnInit() {
    this.loadFlashcards();
  }
}
