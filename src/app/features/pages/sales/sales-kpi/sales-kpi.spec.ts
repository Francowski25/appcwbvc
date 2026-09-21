import { TestBed } from '@angular/core/testing';
import { SalesKpi } from './sales-kpi';

describe('SalesKpi', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesKpi]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SalesKpi);
    fixture.componentRef.setInput('totalVentas', 10);
    fixture.componentRef.setInput('montoTotal', 500.5);
    fixture.componentRef.setInput('ventasHoy', 2);
    fixture.componentRef.setInput('montoHoy', 45.0);
    fixture.componentRef.setInput('ticketPromedio', 50.0);
    fixture.componentRef.setInput('ventasCompletadas', 9);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
