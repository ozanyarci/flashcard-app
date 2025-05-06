import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicFlashcardsComponent } from './public-flashcards.component';

describe('PublicFlashcardsComponent', () => {
  let component: PublicFlashcardsComponent;
  let fixture: ComponentFixture<PublicFlashcardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicFlashcardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicFlashcardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
