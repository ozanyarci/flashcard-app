// src/app/app-routing.module.ts

import {  Routes } from '@angular/router';
import { FlashcardComponent } from './flashcard/flashcard.component';
import { TestComponent } from './test/test.component';
import { MeaningTestComponent } from './meaning-test/meaning-test.component';

export const routes: Routes = [
  { path: 'flashcards', component: FlashcardComponent },
  { path: 'test', component: TestComponent },
  { path: 'meaning-test', component: MeaningTestComponent },
  { path: '', redirectTo: '/flashcards', pathMatch: 'full' }, // Default route
];

export default routes;
