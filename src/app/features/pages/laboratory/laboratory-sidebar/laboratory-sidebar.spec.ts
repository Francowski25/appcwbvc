import { TestBed } from '@angular/core/testing';
import { LaboratorySidebar } from './laboratory-sidebar';

describe('LaboratorySidebar', () => {
  let component: LaboratorySidebar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratorySidebar]
    }).compileComponents();

    const fixture = TestBed.createComponent(LaboratorySidebar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute hayFiltros and emit events', () => {
    const fixture = TestBed.createComponent(LaboratorySidebar);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('busquedaValue', 'test');
    fixture.detectChanges();
    expect(component.hayFiltros()).toBe(true);

    let search = '';
    let status = '';

    component.busquedaChange.subscribe(v => search = v);
    component.estadoChange.subscribe(v => status = v);

    component.onBusquedaInput({ target: { value: 'query' } } as any);
    component.onLimpiarBusqueda();
    component.onLimpiarTodosLosFiltros();

    expect(search).toBe('');
    expect(status).toBe('');
  });
});
