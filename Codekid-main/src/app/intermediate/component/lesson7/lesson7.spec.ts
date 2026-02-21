import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lesson7 } from './lesson7';

describe('Lesson7', () => {
  let component: Lesson7;
  let fixture: ComponentFixture<Lesson7>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lesson7]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lesson7);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
