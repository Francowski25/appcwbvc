import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Expiration } from './expiration';

describe('Expiration', () => {
  let component: Expiration;
  let fixture: ComponentFixture<Expiration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Expiration],
    }).compileComponents();

    fixture = TestBed.createComponent(Expiration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
