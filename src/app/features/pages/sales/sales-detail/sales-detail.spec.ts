import { TestBed } from '@angular/core/testing';
import { SalesDetail } from './sales-detail';

describe('SalesDetail', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesDetail]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SalesDetail);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
