import { TestBed } from '@angular/core/testing';
import { CustomerTable } from './customer-table';

describe('CustomerTable', () => {
  let component: CustomerTable;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerTable]
    }).compileComponents();

    const fixture = TestBed.createComponent(CustomerTable);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CustomerTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('clientes', []);
    expect(component).toBeTruthy();
  });

  it('should paginate items correctly', () => {
    const fixture = TestBed.createComponent(CustomerTable);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('clientes', [
      { name: 'A' }, { name: 'B' }, { name: 'C' }
    ]);
    fixture.componentRef.setInput('filasPorPagina', 2);

    expect(component.paginados().length).toBe(2);
    expect(component.ultimoRegistro()).toBe(2);

    component.onPageChange({ first: 2 });
    expect(component.primerRegistro()).toBe(2);
    expect(component.paginados().length).toBe(1);
    expect(component.ultimoRegistro()).toBe(3);
  });
});
