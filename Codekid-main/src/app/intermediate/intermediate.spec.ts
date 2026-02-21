import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Intermediate } from './intermediate';

describe('Intermediate', () => {
  let component: Intermediate;
  let fixture: ComponentFixture<Intermediate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Intermediate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Intermediate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
