import { TestBed } from '@angular/core/testing';
import { MovementsTable } from './movements-table';

describe('MovementsTable', () => {
  let component: MovementsTable;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovementsTable]
    }).compileComponents();

    const fixture = TestBed.createComponent(MovementsTable);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should paginate and support prev/next actions', () => {
    const fixture = TestBed.createComponent(MovementsTable);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('filtrados', [
      { idMovement: 'm1' }, { idMovement: 'm2' }, { idMovement: 'm3' }
    ]);
    component.filasPorPagina.set(2);
    component.paginaActual.set(0);
    fixture.detectChanges();

    expect(component.primerRegistro()).toBe(1);
    expect(component.ultimoRegistro()).toBe(2);

    component.paginaSiguiente();
    expect(component.paginaActual()).toBe(1);

    component.paginaAnterior();
    expect(component.paginaActual()).toBe(0);

    component.onPageChange({ page: 1, rows: 1 });
    expect(component.paginaActual()).toBe(1);
    expect(component.filasPorPagina()).toBe(1);
  });

  it('should return initials and short ID', () => {
    expect(component.getInitials('John Doe')).toBe('JD');
    expect(component.getInitials('Alice')).toBe('AL');
    expect(component.getInitials('')).toBe('??');

    expect(component.shortenId('abc-def')).toBe('ABC');
    expect(component.shortenId('')).toBe('');
  });
});
