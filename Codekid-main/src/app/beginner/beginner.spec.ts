import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Beginner } from './beginner';

describe('Beginner', () => {
  let component: Beginner;
  let fixture: ComponentFixture<Beginner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Beginner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Beginner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
