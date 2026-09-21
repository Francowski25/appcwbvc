import { TestBed } from '@angular/core/testing';
import { PurchaseSidebar } from './purchase-sidebar';

describe('PurchaseSidebar', () => {
  let component: PurchaseSidebar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseSidebar]
    }).compileComponents();

    const fixture = TestBed.createComponent(PurchaseSidebar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute hayFiltros and emit events', () => {
    const fixture = TestBed.createComponent(PurchaseSidebar);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('busqueda', 'search');
    fixture.detectChanges();
    expect(component.hayFiltros()).toBe(true);

    let search = '';
    let prov = '';

    component.busquedaChange.subscribe(v => search = v);
    component.proveedorChange.subscribe(v => prov = v);

    component.onBusquedaInput({ target: { value: 'query' } } as any);
    component.onProveedorClick('Prov A');

    expect(search).toBe('query');
    expect(prov).toBe('Prov A');
  });
});
