// src/app/app-routing.module.ts

import {  Routes } from '@angular/router';
import { FlashcardComponent } from './flashcard/flashcard.component';
import { TestComponent } from './test/test.component';
import { MeaningTestComponent } from './meaning-test/meaning-test.component';
import { SentenceTestComponent } from './sentence-test/sentence-test.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { AuthGuard } from './auth.guard';
import { SignoutComponent } from './signout/signout.component';
import { PublicFlashcardsComponent } from './public-flashcards/public-flashcards.component';

export const routes: Routes = [
  { path: 'flashcards', component: FlashcardComponent, canActivate: [AuthGuard] },
  { path: 'test', component: TestComponent, canActivate: [AuthGuard]},
  { path: 'meaning-test', component: MeaningTestComponent, canActivate: [AuthGuard] },
  { path: 'sentence-test', component: SentenceTestComponent, canActivate: [AuthGuard] },
  { path: 'public-flashcards', component: PublicFlashcardsComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'signout', component: SignoutComponent }, // Add Sign-Out route
  { path: '', redirectTo: '/signin', pathMatch: 'full' },
  { path: '**', redirectTo: '/signin' }
];


export default routes;
