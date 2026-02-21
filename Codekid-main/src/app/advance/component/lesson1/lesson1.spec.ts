import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lesson1 } from './lesson1';

describe('Lesson1', () => {
  let component: Lesson1;
  let fixture: ComponentFixture<Lesson1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lesson1]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lesson1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
