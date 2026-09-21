import { TestBed } from '@angular/core/testing';
import { SalesSidebar } from './sales-sidebar';

describe('SalesSidebar', () => {
  let component: SalesSidebar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesSidebar]
    }).compileComponents();

    const fixture = TestBed.createComponent(SalesSidebar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit changes and compute hayFiltros correctly', () => {
    const fixture = TestBed.createComponent(SalesSidebar);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('busqueda', 'test');
    fixture.detectChanges();
    expect(component.hayFiltros()).toBe(true);

    let search = '';
    let payMethod = '';
    let status = '';

    component.busquedaChange.subscribe(v => search = v);
    component.metodoPagoChange.subscribe(v => payMethod = v);
    component.estadoChange.subscribe(v => status = v);

    component.onBusquedaInput({ target: { value: 'query' } } as any);
    component.onLimpiarBusqueda();
    component.onMetodoClick('Efectivo');
    component.onEstadoClick('Completada');

    expect(search).toBe('');
    expect(payMethod).toBe('Efectivo');
    expect(status).toBe('Completada');
  });
});
