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
import { ToastrService } from 'ngx-toastr';

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
  newSynonyms: string = '';
  newFavorite: boolean = false;
  customFilterSubject: string = '';
  lastSelectedSubject: string = '';

  constructor(
    private flashcardService: FlashcardService,
    private localStorageService: LocalStorageService,
    private toastr: ToastrService
  ) {}

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
        this.toastr.warning('Please upload a valid image file.');
        return;
      }
      const maxSize = 5 * 1024 * 1024; // 5MB limit
      if (file.size > maxSize) {
        this.toastr.error('The file size exceeds the 5MB limit.');
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
      const subjectValue = this.newSubject || this.lastSelectedSubject || 'Other';
      const now = Date.now();

      // remember last selected subject
      this.lastSelectedSubject = subjectValue;

      const existingCard = this.allFlashcards.find(fc => fc.id === this.currentEditId);

      const flashcard: Flashcard = {
        word: this.newWord.trim(),
        meaning: this.newMeaning.trim(),
        example: this.newExample.trim(),
        level: this.newLevel,
        photo: this.newPhoto ? this.newPhoto.toString() : '',
        subject: subjectValue,
        synonyms: this.newSynonyms
          ? this.newSynonyms.split(',').map(s => s.trim()).filter(s => s)
          : [],
        favorite: this.newFavorite,
        insertionDate: this.editMode && existingCard
          ? existingCard.insertionDate
          : now,
        updateDate: now
      };

      if (this.editMode && this.currentEditId) {
        this.flashcardService.updateFlashcard(this.currentEditId, flashcard).subscribe(() => {
          this.toastr.success('Flashcard updated successfully');
          this.loadFlashcards();
          this.editMode = false;
          this.currentEditId = null;
        }, error => {
          console.error('Error updating flashcard:', error);
          this.toastr.error('Error updating flashcard');
        });
      } else {
        this.flashcardService.addFlashcard(flashcard).subscribe(docRef => {
          this.toastr.success('Flashcard added successfully');

          const createdCard: Flashcard = { ...flashcard, id: docRef.id };
          this.allFlashcards.push(createdCard);
          this.allFlashcards.sort((a, b) => a.insertionDate - b.insertionDate);
          this.applyFilter();
        });
      }

      this.resetForm();
      this.isFlipped = false;
    } else {
      this.toastr.warning('Please enter required fields. Flashcard not added');
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
    this.newFavorite = flashcard.favorite || false;
    this.editMode = true;
    this.currentEditId = flashcard.id || null;
    this.currentFlashcardIndex = index;
    this.newSynonyms = flashcard.synonyms?.join(', ') || '';
  }

  deleteFlashcard(index: number) {
    const flashcardId = this.flashcards[index].id;
    if (flashcardId) {
      this.flashcardService.deletePersonalFlashcard(flashcardId).subscribe(() => {
        this.toastr.success('Flashcard deleted successfully.');
        this.loadFlashcards();
      }, error => {
        console.error('Error deleting flashcard:', error);
        this.toastr.error('Error deleting flashcard.');
      });
    }
    if (this.currentFlashcardIndex >= this.flashcards.length) {
      this.currentFlashcardIndex = this.flashcards.length ? this.flashcards.length - 1 : 0;
    }
    this.isFlipped = false;
  }

  loadFlashcards() {
    this.flashcardService.getFlashcards().subscribe(cards => {
      const normalized = cards.map(card => {
        return {
          ...card,
          insertionDate: this.normalizeDate(card.insertionDate),
          updateDate: this.normalizeDate(card.updateDate)
        } as Flashcard;
      });

      normalized.forEach(card => {
        if (!card.insertionDate || card.insertionDate === 0) {
          const newInsertion = card.updateDate && card.updateDate > 0 ? card.updateDate : Date.now();
          card.insertionDate = newInsertion;

          if (card.id) {
            const patched = { ...card, insertionDate: newInsertion };
            this.flashcardService.updateFlashcard(card.id, patched).subscribe({
              next: () => console.log(`Patched insertionDate for ${card.id}`),
              error: err => console.error('Error patching insertionDate:', err)
            });
          }
        }
      });

      this.allFlashcards = normalized.sort((a, b) => a.insertionDate - b.insertionDate);

      this.flashcardCount = this.allFlashcards.length;
      this.applyFilter();
    }, err => {
      console.error('Error loading flashcards:', err);
      this.toastr.error('Error loading flashcards.');
    });
  }

  private normalizeDate(value: any): number {
    if (value == null) return 0;
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (typeof value === 'string') {
      const asNum = Number(value);
      if (!isNaN(asNum)) return asNum;
      const parsed = Date.parse(value);
      if (!isNaN(parsed)) return parsed;
      return 0;
    }
    try {
      if (typeof value.seconds === 'number') {
        const ms = (value.seconds * 1000) + Math.floor((value.nanoseconds || 0) / 1e6);
        return ms;
      }
      if (typeof value.toDate === 'function') {
        const d = value.toDate();
        if (d instanceof Date && !isNaN(d.getTime())) return d.getTime();
      }
    } catch {}
    return 0;
  }

  applyFilter() {
    if (this.filterSubject === 'All' && this.filterLevel === 'All') {
      this.flashcards = [...this.allFlashcards];
    } else {
      this.flashcards = this.allFlashcards.filter(
        (flashcard) =>
          (this.filterSubject === 'All' || flashcard.subject === this.filterSubject) &&
          (this.filterLevel === 'All' || flashcard.level === this.filterLevel)
      );
    }

    if (this.currentFlashcardIndex >= this.flashcards.length) {
      this.currentFlashcardIndex = this.flashcards.length
        ? this.flashcards.length - 1
        : 0;
    }
  }

  clearLocalStorage() {
    this.localStorageService.clearAllFlashcards();
    this.loadFlashcards();
    this.toastr.info('All flashcards cleared from local storage.');
  }

  openToPublic(index: number) {
    const flashcard = this.flashcards[index];
    flashcard.public = true;
    this.flashcardService.addPublicFlashcard(flashcard).subscribe(() => {
      this.toastr.success('Flashcard opened to public successfully.');
    }, err => {
      console.error('Error opening flashcard to public:', err);
      this.toastr.error('Error opening flashcard to public.');
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
    this.newFavorite = false;
    this.editMode = false;
    this.currentEditId = null;
    this.currentIndex = null;
    this.newSynonyms = '';

    // keep subject unless user changes it
    if (!this.newSubject) {
      this.newSubject = this.lastSelectedSubject || 'Other';
    }
  }


  toggleFavorite(flashcard: Flashcard) {
    flashcard.favorite = !flashcard.favorite;
    if (flashcard.id) {
      this.flashcardService.updateFlashcard(flashcard.id, flashcard).subscribe(() => {
        this.toastr.info('Favorite status updated.');
      }, error => {
        console.error('Error updating favorite status:', error);
        this.toastr.error('Error updating favorite status.');
      });
    }
  }

  ngOnInit() {
    this.loadFlashcards();
    this.loadSubjects();
  }

  loadSubjects() {
    this.flashcardService.getSubjects().subscribe((subjects) => {
      const defaults: Subject[] = [
        { name: 'English' },
        { name: 'German' },
        { name: 'French' },
        { name: 'Other' }
      ];
      if (subjects.length) {
        this.subjects = Array.from(new Set([...subjects]));
      } else {
        this.subjects = defaults;
      }
    }, err => {
      console.error('Error loading subjects:', err);
      this.toastr.error('Error loading subjects.');
    });
  }

  hasEnoughFlashcards(): boolean {
    return this.flashcardCount >= 4;
  }
}
