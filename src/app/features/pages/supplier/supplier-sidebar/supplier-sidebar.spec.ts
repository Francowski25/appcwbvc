import { TestBed } from '@angular/core/testing';
import { SupplierSidebar } from './supplier-sidebar';

describe('SupplierSidebar', () => {
  let component: SupplierSidebar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierSidebar]
    }).compileComponents();

    const fixture = TestBed.createComponent(SupplierSidebar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should evaluate hayFiltros and emit values correctly', () => {
    const fixture = TestBed.createComponent(SupplierSidebar);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('busqueda', 'search-term');
    fixture.detectChanges();
    expect(component.hayFiltros()).toBe(true);

    let search = '';
    let status = '';

    component.busquedaChange.subscribe(v => search = v);
    component.estadoChange.subscribe(v => status = v);

    component.onBusquedaInput({ target: { value: 'query' } } as any);
    component.onLimpiarBusqueda();
    component.onEstadoClick('activo');

    expect(search).toBe('');
    expect(status).toBe('activo');
  });
});
