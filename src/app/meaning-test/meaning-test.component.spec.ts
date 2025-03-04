import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeaningTestComponent } from './meaning-test.component';

describe('MeaningTestComponent', () => {
  let component: MeaningTestComponent;
  let fixture: ComponentFixture<MeaningTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeaningTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeaningTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
