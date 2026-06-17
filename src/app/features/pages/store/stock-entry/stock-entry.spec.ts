import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockEntry } from './stock-entry';

describe('StockEntry', () => {
  let component: StockEntry;
  let fixture: ComponentFixture<StockEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockEntry],
    }).compileComponents();

    fixture = TestBed.createComponent(StockEntry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
