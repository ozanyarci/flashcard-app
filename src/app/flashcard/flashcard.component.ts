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
import { LocalStorageService } from '../local-storage.service';
import { Subject } from '../models/subject';

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
  subjects: Subject[] = [
    { name: 'English' },
    { name: 'German' },
    { name: 'French' },
    { name: 'Other' }
  ];
  newSynonyms: string = '';  // Add this line
  newFavorite: boolean = false;  // Add this line
  customFilterSubject: string = '';


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
      const subjectValue = this.newSubject;

      const flashcard: Flashcard = {
        word: this.newWord.trim(),
        meaning: this.newMeaning.trim(),
        example: this.newExample.trim(),
        level: this.newLevel,
        photo: this.newPhoto ? this.newPhoto.toString() : '',
        subject: subjectValue,
        synonyms: this.newSynonyms ? this.newSynonyms.split(',').map(s => s.trim()).filter(s => s) : [],
        favorite: this.newFavorite
      };

        if (this.editMode && this.currentEditId) {
          this.flashcardService.updateFlashcard(this.currentEditId, flashcard).subscribe(() => {
            alert('Flashcard updated successfully.');

            // ✅ Reload all flashcards from Firestore (ensures subject filter works)
            this.loadFlashcards();
            // ✅ Reset subject filter so updated card is visible
            this.filterSubject = 'All';
            this.filterLevel = 'All';
            this.applyFilter();
            this.editMode = false;
            this.currentEditId = null;
          }, error => {
            console.error('Error updating flashcard:', error);
            alert('Error updating flashcard.');
          });
        }

      else {
        // 🔹 ADD
        this.flashcardService.addFlashcard(flashcard).subscribe(docRef => {
          alert('Flashcard added successfully.');

          // ✅ Append new card at the END of the array
          const createdCard: Flashcard = { ...flashcard, id: docRef.id };
          this.allFlashcards.push(createdCard);

          this.applyFilter(); // ✅ filter immediately includes it
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
    this.newFavorite = flashcard.favorite || false;  // Add this line
    this.editMode = true;
    this.currentEditId = flashcard.id || null;
    this.currentFlashcardIndex = index;
    this.newSynonyms = flashcard.synonyms?.join(', ') || '';  // Add this line
  }

  deleteFlashcard(index: number) {
    const flashcardId = this.flashcards[index].id;
    if (flashcardId) {
      this.flashcardService.deletePersonalFlashcard(flashcardId).subscribe(() => {
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
      this.allFlashcards = flashcards; // keep the original full list
      this.flashcards = flashcards;    // working copy for filtering
      this.flashcardCount = flashcards.length;
    });
  }


  applyFilter() {
    if (this.filterSubject === 'All' && this.filterLevel === 'All') {
      // Reset to all flashcards
      this.flashcards = [...this.allFlashcards];
    } else {
      this.flashcards = this.allFlashcards.filter(
        (flashcard) =>
          (this.filterSubject === 'All' ||
            (this.filterSubject === 'Other'
              ? flashcard.subject === this.customFilterSubject.trim()
              : flashcard.subject === this.filterSubject)) &&
          (this.filterLevel === 'All' || flashcard.level === this.filterLevel)
      );
    }

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
    this.newFavorite = false;  // Add this line
    this.editMode = false;
    this.currentEditId = null;
    this.currentIndex = null;
    this.newSynonyms = '';  // Add this line
  }

  toggleFavorite(flashcard: Flashcard) {
    flashcard.favorite = !flashcard.favorite;
    if (flashcard.id) {
      this.flashcardService.updateFlashcard(flashcard.id, flashcard).subscribe(() => {
        console.log('Favorite status updated');
      }, error => {
        console.error('Error updating favorite status:', error);
      });
    }
  }

  ngOnInit() {
    this.loadFlashcards();
    this.loadSubjects();
  }

  loadSubjects() {
    this.flashcardService.getSubjects().subscribe((subjects) => {
      const defaults : Subject[] = [
        { name: 'English' },
        { name: 'German' },
        { name: 'French' },
        { name: 'Other' }
      ];
      if (subjects.length) {
        // merge defaults + Firestore
        this.subjects = Array.from(new Set([...subjects]));
      } else {
        this.subjects = defaults;
      }
    });
  }


  hasEnoughFlashcards(): boolean {
    return this.flashcardCount >= 4;
  }

}


