import { TestBed } from '@angular/core/testing';
import { CustomerSidebar } from './customer-sidebar';

describe('CustomerSidebar', () => {
  let component: CustomerSidebar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerSidebar]
    }).compileComponents();

    const fixture = TestBed.createComponent(CustomerSidebar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute hayFiltros correctly', () => {
    const fixture = TestBed.createComponent(CustomerSidebar);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('busqueda', '');
    fixture.componentRef.setInput('tipoDocSeleccionado', '');
    expect(component.hayFiltros()).toBe(false);

    fixture.componentRef.setInput('busqueda', 'Juan');
    expect(component.hayFiltros()).toBe(true);
  });

  it('should emit changes on search input and clear search', () => {
    let busqueda = '';
    component.busquedaChange.subscribe(v => busqueda = v);

    component.onBusquedaInput({ target: { value: 'Maria' } } as any);
    expect(busqueda).toBe('Maria');

    component.onLimpiarBusqueda();
    expect(busqueda).toBe('');
  });

  it('should toggle document type on click', () => {
    const fixture = TestBed.createComponent(CustomerSidebar);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tipoDocSeleccionado', 'DNI');

    let selectedDocType = '';
    component.tipoDocChange.subscribe(v => selectedDocType = v);

    component.onTipoDocClick('DNI');
    expect(selectedDocType).toBe(''); // same doc type, toggle off

    fixture.componentRef.setInput('tipoDocSeleccionado', 'DNI');
    component.onTipoDocClick('RUC');
    expect(selectedDocType).toBe('RUC'); // different doc type, toggle on
  });

  it('should clear all filters', () => {
    let cleared = false;
    component.limpiarFiltros.subscribe(() => cleared = true);
    component.onLimpiarTodosLosFiltros();
    expect(cleared).toBe(true);
  });

  it('should return correct icon depending on doc type', () => {
    expect(component.getIcono('DNI')).toBe('pi pi-id-card');
    expect(component.getIcono('RUC')).toBe('pi pi-building');
    expect(component.getIcono('PASAPORTE')).toBe('pi pi-globe');
    expect(component.getIcono('CE')).toBe('pi pi-globe');
    expect(component.getIcono('OTHER')).toBe('pi pi-user');
  });
});
