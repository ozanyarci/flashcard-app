export interface Flashcard {
  id?: string; // Add this field for Firestore document ID
  word: string;
  meaning: string;
  example?: string;
  level?: string;
  photo?: string | null; // Optional photo field
  subject: string; // Subject or Deck
  createdBy?: string | undefined;  // Add `createdBy` field to Flashcard
  creator?: Creator;  // Add `creator` field to Flashcard
  public?: boolean;   // Add `public` field to Flashcard
  synonyms?: string[];  // Add this line
}

export interface Creator {
  name: string;
}

