import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lesson8 } from './lesson8';

describe('Lesson8', () => {
  let component: Lesson8;
  let fixture: ComponentFixture<Lesson8>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lesson8]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lesson8);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
