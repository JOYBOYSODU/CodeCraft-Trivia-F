import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Advance } from './advance';

describe('Advance', () => {
  let component: Advance;
  let fixture: ComponentFixture<Advance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Advance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Advance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
