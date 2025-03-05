import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentenceTestComponent } from './sentence-test.component';

describe('SentenceTestComponent', () => {
  let component: SentenceTestComponent;
  let fixture: ComponentFixture<SentenceTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SentenceTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SentenceTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
