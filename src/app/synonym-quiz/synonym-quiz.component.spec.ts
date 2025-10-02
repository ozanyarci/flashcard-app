import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SynonymQuizComponent } from './synonym-quiz.component';

describe('SynonymQuizComponent', () => {
  let component: SynonymQuizComponent;
  let fixture: ComponentFixture<SynonymQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SynonymQuizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SynonymQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
