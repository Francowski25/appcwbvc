import { TestBed } from '@angular/core/testing';
import { LotSidebar } from './lot-sidebar';

describe('LotSidebar', () => {
  let component: LotSidebar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LotSidebar]
    }).compileComponents();

    const fixture = TestBed.createComponent(LotSidebar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute proveedoresFiltrados and estadosFiltrados', () => {
    const fixture = TestBed.createComponent(LotSidebar);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('proveedores', [{ name: 'Prov A', count: 10 }]);
    fixture.componentRef.setInput('estados', [{ name: 'Optimo', count: 5 }]);

    fixture.detectChanges();

    component.busquedaProveedor.set('prov');
    expect(component.proveedoresFiltrados().length).toBe(1);
    expect(component.proveedoresFiltrados()[0].name).toBe('Prov A');

    component.busquedaEstado.set('opt');
    expect(component.estadosFiltrados().length).toBe(1);
    expect(component.estadosFiltrados()[0].name).toBe('Optimo');
  });

  it('should evaluate esSeleccionExacta correctly', () => {
    const fixture = TestBed.createComponent(LotSidebar);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('proveedores', [{ name: 'Prov A', count: 10 }]);
    fixture.componentRef.setInput('estados', [{ name: 'Optimo', count: 5 }]);

    fixture.detectChanges();

    component.busquedaProveedor.set('Prov A');
    expect(component.esSeleccionExactaProveedor()).toBe(true);

    component.busquedaEstado.set('Optimo');
    expect(component.esSeleccionExactaEstado()).toBe(true);
  });

  it('should handle event change search emitters', () => {
    let search = '';
    let prov = '';
    let est = '';
    component.searchChange.subscribe(v => search = v);
    component.proveedorChange.subscribe(v => prov = v);
    component.estadoChange.subscribe(v => est = v);

    component.onSearch({ target: { value: 'query' } } as any);
    component.onBuscarProveedor({ target: { value: 'prov' } } as any);
    component.onBuscarEstado({ target: { value: 'est' } } as any);

    expect(search).toBe('query');
    expect(prov).toBe('prov');
    expect(est).toBe('est');
  });

  it('should handle item selection', () => {
    let prov = '';
    let est = '';
    component.proveedorChange.subscribe(v => prov = v);
    component.estadoChange.subscribe(v => est = v);

    component.seleccionarProveedor('Prov A');
    component.seleccionarEstado('Optimo');

    expect(prov).toBe('Prov A');
    expect(est).toBe('Optimo');
  });

  it('should clear fields', () => {
    component.busquedaGeneral.set('val');
    component.busquedaProveedor.set('val');
    component.busquedaEstado.set('val');

    component.limpiarTodosLosFiltros();

    expect(component.busquedaGeneral()).toBe('');
    expect(component.busquedaProveedor()).toBe('');
    expect(component.busquedaEstado()).toBe('');
  });

  it('should return correct badge styles and icons', () => {
    expect(component.getBadgeIcon('óptimo')).toBe('pi pi-check-circle');
    expect(component.getBadgeIcon('por vencer')).toBe('pi pi-exclamation-triangle');
    expect(component.getBadgeIcon('vencido')).toBe('pi pi-times-circle');
    expect(component.getBadgeIcon('agotado')).toBe('pi pi-ban');
    expect(component.getBadgeIcon('unknown')).toBe('pi pi-info-circle');

    expect(component.getBadgeStyle('óptimo')).toBe('bg-emerald-50 text-emerald-600');
    expect(component.getBadgeStyle('por vencer')).toBe('bg-amber-50 text-amber-600');
    expect(component.getBadgeStyle('vencido')).toBe('bg-rose-50 text-rose-600');
    expect(component.getBadgeStyle('agotado')).toBe('bg-slate-100 text-slate-500');
    expect(component.getBadgeStyle('unknown')).toBe('bg-gray-100 text-gray-500');
  });
});
