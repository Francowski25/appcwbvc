import { TestBed, ComponentFixture } from '@angular/core/testing';
import { InventoryTable } from './inventory-table';

describe('InventoryTable', () => {
  let component: InventoryTable;
  let fixture: ComponentFixture<InventoryTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryTable]
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('productos', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute deficit correctly', () => {
    expect(component.getDeficit({ stockMinimum: 10, totalStock: 3 })).toBe(7);
    expect(component.getDeficit({ stockMinimum: 10, totalStock: 15 })).toBe(0);
  });

  it('should handle local pagination and search inputs', () => {
    fixture.componentRef.setInput('productos', [
      { name: 'P1' }, { name: 'P2' }
    ]);
    fixture.detectChanges();

    let search = '';
    component.busqueda.subscribe(v => search = v);

    component.onBusqueda({ target: { value: 'query' } } as any);
    expect(search).toBe('query');
    expect(component.paginaActual()).toBe(0);

    component.onPageChange({ page: 2, rows: 5 });
    expect(component.paginaActual()).toBe(2);
    expect(component.filasPorPagina()).toBe(5);
  });
});
