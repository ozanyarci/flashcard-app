import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MistakesTestComponent } from './mistakes-test.component';

describe('MistakesTestComponent', () => {
  let component: MistakesTestComponent;
  let fixture: ComponentFixture<MistakesTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MistakesTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MistakesTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
