import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lesson5 } from './lesson5';

describe('Lesson5', () => {
  let component: Lesson5;
  let fixture: ComponentFixture<Lesson5>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lesson5]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lesson5);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
