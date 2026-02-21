import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lesson4 } from './lesson4';

describe('Lesson4', () => {
  let component: Lesson4;
  let fixture: ComponentFixture<Lesson4>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lesson4]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Lesson4);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
