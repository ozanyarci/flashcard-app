export interface Flashcard {
  id?: string; // Add this field for Firestore document ID
  word: string;
  meaning: string;
  example?: string;
  level?: string;
  photo?: string | null; // Optional photo field
  subject: string; // Subject or Deck
}
