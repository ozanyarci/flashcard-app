import { Component, OnInit } from '@angular/core';
import { FlashcardService } from '../flashcard.service';
import { Subject } from '../models/subject';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
@Component({
  selector: 'app-subject-manager',
  templateUrl: './subject-manager.component.html',
  imports: [FormsModule, CommonModule, MatInputModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatDividerModule,MatIconModule, MatListModule],
  standalone: true,
  styleUrls: ['./subject-manager.component.css']
})
export class SubjectManagerComponent implements OnInit {
  subjects: Subject[] = [];
  newSubject: string = '';

  constructor(private flashcardService: FlashcardService) {}

  ngOnInit() {
    this.loadSubjects();
  }

  loadSubjects() {
    this.flashcardService.getSubjects().subscribe(subjects => {
      this.subjects = subjects;
    });
  }

  addSubject() {
    if (!this.newSubject.trim()) return;

    this.flashcardService.addSubject(this.newSubject.trim()).subscribe(() => {
      this.loadSubjects();
      this.newSubject = '';
    });
  }

  deleteSubject(subjectName: string) {
    if (!confirm(`Delete subject "${subjectName}"? Flashcards will be moved to "Other".`)) return;

    // 1️⃣ Get all flashcards first
    this.flashcardService.getFlashcards().subscribe(flashcards => {
      const affectedFlashcards = flashcards.filter(fc => fc.subject === subjectName);

      // 2️⃣ Update each affected flashcard to "Other"
      affectedFlashcards.forEach(fc => {
        if (fc.id) {
          const updatedFlashcard = { ...fc, subject: 'Other' };
          this.flashcardService.updateFlashcard(fc.id, updatedFlashcard).subscribe();
        }
      });

      // 3️⃣ Delete the subject from Firestore
      this.flashcardService.getSubjects().subscribe(subjects => {
        const target = subjects.find(s => s.name === subjectName);
        if (target?.id) {
          this.flashcardService.deleteSubject(target.id).subscribe(() => {
            // 4️⃣ Refresh subject list locally
            this.subjects = this.subjects.filter(s => s.name !== subjectName);
            console.log(`Subject "${subjectName}" deleted and flashcards moved to "Other"`);
          });
        }
      });
    });
  }



}
