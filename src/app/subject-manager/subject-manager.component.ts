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

@Component({
  selector: 'app-subject-manager',
  templateUrl: './subject-manager.component.html',
  imports: [FormsModule, RouterLink, CommonModule, MatInputModule, MatButtonModule, MatCardModule, MatFormFieldModule],
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

  deleteSubject(subject: Subject) {
    if (!confirm(`Delete subject "${subject.name}"? Flashcards will be moved to "Other".`)) return;

    if (subject.id) {
      this.flashcardService.deleteSubject(subject.id).subscribe(() => {
        this.subjects = this.subjects.filter(s => s.id !== subject.id);
      });
    }
  }
}
