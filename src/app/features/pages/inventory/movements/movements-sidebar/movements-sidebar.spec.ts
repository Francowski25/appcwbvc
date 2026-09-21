import { TestBed } from '@angular/core/testing';
import { MovementsSidebar } from './movements-sidebar';

describe('MovementsSidebar', () => {
  let component: MovementsSidebar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovementsSidebar]
    }).compileComponents();

    const fixture = TestBed.createComponent(MovementsSidebar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute states and emit filter changes', () => {
    const fixture = TestBed.createComponent(MovementsSidebar);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('movimientos', [
      { type: 'Entrada' },
      { type: 'Salida' }
    ]);
    fixture.componentRef.setInput('busquedaValue', 'test');
    fixture.detectChanges();

    expect(component.hayFiltros()).toBe(true);
    expect(component.totalMovimientos()).toBe(2);
    expect(component.tipos[0].count()).toBe(1);

    let search = '';
    component.busquedaChange.subscribe(v => search = v);

    component.onBusquedaInput({ target: { value: 'query' } } as any);
    expect(search).toBe('query');

    component.onLimpiarBusqueda();
    expect(search).toBe('');

    let resetCalled = false;
    component.limpiarFiltros.subscribe(() => resetCalled = true);
    component.onLimpiarTodosLosFiltros();
    expect(resetCalled).toBe(true);
  });
});
