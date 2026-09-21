import { TestBed } from '@angular/core/testing';
import { ProductKpi } from './product-kpi';

describe('ProductKpi', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductKpi]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProductKpi);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
