import { TestBed } from '@angular/core/testing';
import { CategorySidebar } from './category-sidebar';

describe('CategorySidebar', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorySidebar]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CategorySidebar);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should emit changes when methods are called', () => {
    const fixture = TestBed.createComponent(CategorySidebar);
    const component = fixture.componentInstance;

    let busquedaValue = '';
    component.busquedaChange.subscribe(v => busquedaValue = v);

    component.onBusquedaInput({ target: { value: 'test' } } as any);
    expect(busquedaValue).toBe('test');

    component.onLimpiarBusqueda();
    expect(busquedaValue).toBe('');
  });

  it('should clear all filters', () => {
    const fixture = TestBed.createComponent(CategorySidebar);
    const component = fixture.componentInstance;

    let busqueda = 'some';
    let estado = 'active';
    component.busquedaChange.subscribe(v => busqueda = v);
    component.estadoChange.subscribe(v => estado = v);

    component.onLimpiarTodosLosFiltros();
    expect(busqueda).toBe('');
    expect(estado).toBe('');
  });
});
