import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FlashcardService } from '../flashcard.service';
import { Flashcard } from '../models/flashcard';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-dictionary-view',
  imports: [FormsModule, RouterLink, CommonModule, MatInputModule, MatButtonModule, MatCardModule, MatFormFieldModule],
  standalone: true,
  templateUrl: './dictionary-view.component.html',
  styleUrls: ['./dictionary-view.component.css']
})
export class DictionaryViewComponent implements OnInit {
  letters: string[] = [];
  groupedFlashcards: Record<string, Flashcard[]> = {};
  @ViewChild('dictionaryContent', { static: false }) dictionaryContent!: ElementRef;
   @Input() flashcards: Flashcard[] = [];
   tempFlashcards: Flashcard[] = [];
  constructor(private flashcardService: FlashcardService) {}

  ngOnInit() {
    this.loadFlashcards();
  }

  private loadFlashcards() {
    this.flashcardService.getFlashcards().subscribe(cards => {
      // Normalize word to start with uppercase letter
      const grouped: { [key: string]: Flashcard[] } = {};
      this.tempFlashcards = cards;
      cards.forEach(card => {
        const firstLetter = card.word?.charAt(0).toUpperCase() || '#';
        if (!grouped[firstLetter]) grouped[firstLetter] = [];
        grouped[firstLetter].push(card);
      });

      // Sort letters A-Z
      this.letters = Object.keys(grouped).sort();

      // Sort flashcards within each group alphabetically
      this.letters.forEach(letter => {
        grouped[letter].sort((a, b) => a.word.localeCompare(b.word));
      });

      this.groupedFlashcards = grouped;
    });
  }

  ngOnChanges() {
      if (this.flashcards) {
        this.flashcards.sort((a, b) => a.word.localeCompare(b.word));
        this.groupedFlashcards = this.flashcards.reduce((acc, card) => {
          const letter = card.word.charAt(0).toUpperCase();
          if (!acc[letter]) acc[letter] = [];
          acc[letter].push(card);
          return acc;
        }, {} as Record<string, Flashcard[]>);

        this.letters = Object.keys(this.groupedFlashcards).sort();
      }
  }

  printPDF() {
    const element = this.dictionaryContent.nativeElement;

    const opt = {
      margin: 20,
      filename: 'dictionary.pdf',
      image: { type: "jpeg" as const, quality: 0.9 },
      html2canvas: { scale: 1.5 },
      jsPDF: { unit: 'mm', format: 'a4' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };




    // New Promise-based usage:
    html2pdf().set(opt).from(element).save();
    }


}
