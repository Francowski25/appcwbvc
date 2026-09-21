import { TestBed } from '@angular/core/testing';
import { ProductKardex } from './product-kardex';

describe('ProductKardex', () => {
  let component: ProductKardex;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductKardex]
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductKardex);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute list statistics correctly', () => {
    const fixture = TestBed.createComponent(ProductKardex);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('kardexData', {
      productName: 'Aspirina',
      saldoActual: 50,
      listKardex: [
        { type: 'Entrada', movimiento: 20, saldoResultante: 50 },
        { type: 'Salida', movimiento: -10, saldoResultante: 30 }
      ]
    });
    fixture.detectChanges();

    expect(component.kardexList().length).toBe(2);
    expect(component.saldoActual()).toBe(50);
    expect(component.totalEntradas()).toBe(20);
    expect(component.totalSalidas()).toBe(10);
    expect(component.productName()).toBe('Aspirina');
  });

  it('should handle pagination changes', () => {
    const fixture = TestBed.createComponent(ProductKardex);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('kardexData', {
      listKardex: [
        { id: 1 }, { id: 2 }, { id: 3 }
      ]
    });
    component.filasPorPagina.set(2);
    component.first.set(0);
    fixture.detectChanges();

    expect(component.primerRegistro()).toBe(1);
    expect(component.ultimoRegistro()).toBe(2);
    expect(component.paginatedList().length).toBe(2);

    component.onPageChange({ first: 2, rows: 2 });
    expect(component.first()).toBe(2);
    expect(component.primerRegistro()).toBe(3);
    expect(component.ultimoRegistro()).toBe(3);
  });

  it('should debounce search inputs', async () => {
    let queryResult = '';
    component.onSearchProduct.subscribe(q => queryResult = q);

    component.onProductSearchInput({ target: { value: 'Paracetamol' } } as any);
    component.onInputFocus();

    await new Promise(resolve => setTimeout(resolve, 350));
    expect(queryResult).toBe('Paracetamol');
  });

  it('should handle product selection and clear searches', () => {
    let selectedId = '';
    component.onSelectProduct.subscribe(id => selectedId = id);

    component.selectProduct({ idProduct: 'p99', name: 'Ibuprofeno' });
    expect(component.selectedProduct()).toEqual(expect.objectContaining({ idProduct: 'p99' }));
    expect(component.searchProductQuery()).toBe('Ibuprofeno');
    expect(selectedId).toBe('p99');

    component.clearSearch();
    expect(component.searchProductQuery()).toBe('');
    expect(component.selectedProduct()).toBeNull();
  });

  it('should detect expired batches', () => {
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    expect(component.isExpired(pastDate.toISOString())).toBe(true);

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    expect(component.isExpired(futureDate.toISOString())).toBe(false);

    expect(component.isExpired('')).toBe(false);
  });
});
