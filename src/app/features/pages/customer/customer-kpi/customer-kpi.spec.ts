import { TestBed } from '@angular/core/testing';
import { CustomerKpi } from './customer-kpi';

describe('CustomerKpi', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerKpi]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CustomerKpi);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
