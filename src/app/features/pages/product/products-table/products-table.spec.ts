import { TestBed } from '@angular/core/testing';
import { ProductsTable } from './products-table';

describe('ProductsTable', () => {
  let component: ProductsTable;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsTable]
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductsTable);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should paginate products correctly', () => {
    const fixture = TestBed.createComponent(ProductsTable);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('filtrados', [
      { name: 'Prod A' }, { name: 'Prod B' }, { name: 'Prod C' }
    ]);
    component.filasPorPagina.set(2);
    component.paginaActual.set(0);

    expect(component.paginasTotales()).toBe(2);
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
