import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lesson3 } from './lesson3';

describe('Lesson3', () => {
  let component: Lesson3;
  let fixture: ComponentFixture<Lesson3>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lesson3]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lesson3);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
