import { TestBed } from '@angular/core/testing';
import { SalesTable } from './sales-table';

describe('SalesTable', () => {
  let component: SalesTable;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesTable]
    }).compileComponents();

    const fixture = TestBed.createComponent(SalesTable);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SalesTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('ventas', []);
    expect(component).toBeTruthy();
  });

  it('should calculate pagination properties correctly', () => {
    const fixture = TestBed.createComponent(SalesTable);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('ventas', [
      { id: 1 }, { id: 2 }, { id: 3 }
    ]);
    component.filasPorPagina.set(2);
    component.paginaActual.set(0);

    expect(component.primerRegistro()).toBe(1);
    expect(component.ultimoRegistro()).toBe(2);
    expect(component.paginados().length).toBe(2);

    component.onPageChange({ page: 1, rows: 2 });
    expect(component.paginaActual()).toBe(1);
    expect(component.primerRegistro()).toBe(3);
    expect(component.ultimoRegistro()).toBe(3);
    expect(component.paginados().length).toBe(1);
  });
});
