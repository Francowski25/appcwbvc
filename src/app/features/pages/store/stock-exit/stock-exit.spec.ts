import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockExit } from './stock-exit';

describe('StockExit', () => {
  let component: StockExit;
  let fixture: ComponentFixture<StockExit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockExit],
    }).compileComponents();

    fixture = TestBed.createComponent(StockExit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
