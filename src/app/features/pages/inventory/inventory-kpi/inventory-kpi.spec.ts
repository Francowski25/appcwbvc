import { TestBed } from '@angular/core/testing';
import { InventoryKpi } from './inventory-kpi';

describe('InventoryKpi', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryKpi]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(InventoryKpi);
    fixture.componentRef.setInput('totalProductos', 10);
    fixture.componentRef.setInput('agotados', 0);
    fixture.componentRef.setInput('criticos', 2);
    fixture.componentRef.setInput('enAlerta', 1);
    fixture.componentRef.setInput('optimos', 7);
    fixture.componentRef.setInput('saludInventario', 95.0);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
