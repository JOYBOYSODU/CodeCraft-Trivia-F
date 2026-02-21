import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lesson6 } from './lesson6';

describe('Lesson6', () => {
  let component: Lesson6;
  let fixture: ComponentFixture<Lesson6>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lesson6]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lesson6);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
