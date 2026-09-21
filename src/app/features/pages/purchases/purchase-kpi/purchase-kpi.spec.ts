import { TestBed } from '@angular/core/testing';
import { PurchaseKpi } from './purchase-kpi';

describe('PurchaseKpi', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseKpi]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PurchaseKpi);
    fixture.componentRef.setInput('totalCompras', 10);
    fixture.componentRef.setInput('montoTotal', 5000.5);
    fixture.componentRef.setInput('proveedoresDistintos', 3);
    fixture.componentRef.setInput('promedioPorCompra', 500.0);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
