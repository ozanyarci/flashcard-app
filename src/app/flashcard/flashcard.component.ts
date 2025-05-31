import { Component, OnInit } from '@angular/core';
import { FlashcardService } from '../flashcard.service';
import { Flashcard } from '../models/flashcard';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LocalStorageService } from '../local-storage.service'; // Import LocalStorageService

@Component({
  selector: 'app-flashcard',
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    FormsModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  standalone: true,
  templateUrl: './flashcard.component.html',
  styleUrls: ['./flashcard.component.css']
})
export class FlashcardComponent implements OnInit {
  newWord: string = '';
  newMeaning: string = '';
  newExample: string = '';
  newLevel: string = 'Other';
  newPhoto: string | ArrayBuffer | null = null;
  newSubject: string = '';
  filterSubject: string = 'All';
  filterLevel: string = 'All';
  editMode: boolean = false;
  currentEditId: string | null = null;
  allFlashcards: Flashcard[] = [];
  flashcards: Flashcard[] = [];
  currentFlashcardIndex: number = 0;
  isFlipped: boolean = false;
  currentIndex: number | null = null;
  flashcardCount: number = 0;
  levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Other'];
  filterLevels = ['All', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Other'];
  subjects = ['English', 'German', 'French', 'Other'];
  newSynonyms: string = '';  // Add this line

  constructor(private flashcardService: FlashcardService, private localStorageService: LocalStorageService) {}

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
      const maxSize = 5 * 1024 * 1024; // 5MB limit
      if (file.size > maxSize) {
        alert('The file size exceeds the 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.newPhoto = e.target?.result || null;
      };
      reader.readAsDataURL(file);
    }
  }

  addOrUpdateFlashcard() {
    if (this.newWord.trim() && this.newMeaning.trim() && this.newSubject.trim()) {
      const flashcard: Flashcard = {
        word: this.newWord.trim(),
        meaning: this.newMeaning.trim(),
        example: this.newExample.trim(),
        level: this.newLevel,
        photo: this.newPhoto ? this.newPhoto.toString() : '',
        subject: this.newSubject,
        synonyms: this.newSynonyms  // Add this line
        ? this.newSynonyms.split(',').map(s => s.trim()).filter(s => s)
        : [],
      };

      if (this.editMode && this.currentEditId) {
        this.flashcardService.updateFlashcard(this.currentEditId, flashcard).subscribe(() => {
          this.editMode = false;
          this.currentEditId = null;
          alert('Flashcard updated successfully.');
          this.loadFlashcards();
        }, error => {
          console.error('Error updating flashcard:', error);
          alert('Error updating flashcard.');
        });
      } else {
        this.flashcardService.addFlashcard(flashcard).subscribe(() => {
          alert('Flashcard added successfully.');
          this.loadFlashcards();
        }, error => {
          console.error('Error adding flashcard:', error);
          alert('Error adding flashcard.');
        });
      }

      this.resetForm();
      this.isFlipped = false;
    } else {
      alert('All fields are required.');
    }
  }

  editFlashcard(index: number) {
    const flashcard = this.flashcards[index];
    this.newWord = flashcard.word;
    this.newMeaning = flashcard.meaning;
    this.newExample = flashcard.example || '';
    this.newLevel = flashcard.level || 'Other';
    this.newPhoto = flashcard.photo || null;
    this.newSubject = flashcard.subject || '';
    this.editMode = true;
    this.currentEditId = flashcard.id || null;
    this.currentFlashcardIndex = index;
    this.newSynonyms = flashcard.synonyms?.join(', ') || '';  // Add this line
  }

  deleteFlashcard(index: number) {
    const flashcardId = this.flashcards[index].id;
    if (flashcardId) {
      this.flashcardService.deleteFlashcard(flashcardId).subscribe(() => {
        alert('Flashcard deleted successfully.');
        this.loadFlashcards();
      }, error => {
        console.error('Error deleting flashcard:', error);
        alert('Error deleting flashcard.');
      });
    }
    if (this.currentFlashcardIndex >= this.flashcards.length) {
      this.currentFlashcardIndex = this.flashcards.length ? this.flashcards.length - 1 : 0;
    }
    this.isFlipped = false;
  }

  loadFlashcards() {
    this.flashcardService.getFlashcards().subscribe((flashcards) => {
      this.flashcards = flashcards;
      this.flashcardCount = flashcards.length;
    });
  }

  applyFilter() {
    this.flashcards = this.allFlashcards.filter(
      (flashcard) =>
        (this.filterSubject === 'All' || flashcard.subject === this.filterSubject) &&
        (this.filterLevel === 'All' || flashcard.level === this.filterLevel)
    );
    if (this.currentFlashcardIndex >= this.flashcards.length) {
      this.currentFlashcardIndex = this.flashcards.length ? this.flashcards.length - 1 : 0;
    }
  }

  clearLocalStorage() {
    this.localStorageService.clearAllFlashcards();
    this.loadFlashcards();
    alert('All flashcards cleared from local storage');
  }

  openToPublic(index: number) {
    const flashcard = this.flashcards[index];
    flashcard.public = true;
    this.flashcardService.addPublicFlashcard(flashcard).subscribe(() => {
      alert('Flashcard opened to public successfully.');
    });
  }

  nextFlashcard() {
    if (this.currentFlashcardIndex < this.flashcards.length - 1) {
      this.currentFlashcardIndex++;
      this.isFlipped = false;
    }
  }

  previousFlashcard() {
    if (this.currentFlashcardIndex > 0) {
      this.currentFlashcardIndex--;
      this.isFlipped = false;
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
    this.newSubject = '';
    this.editMode = false;
    this.currentEditId = null;
    this.currentIndex = null;
    this.newSynonyms = '';  // Add this line
  }

  ngOnInit() {
    this.loadFlashcards();
  }

  hasEnoughFlashcards(): boolean {
    return this.flashcardCount >= 4;
  }
}
