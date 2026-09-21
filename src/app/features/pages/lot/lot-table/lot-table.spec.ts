import { TestBed } from '@angular/core/testing';
import { LotTable } from './lot-table';

describe('LotTable', () => {
  let component: LotTable;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LotTable]
    }).compileComponents();

    const fixture = TestBed.createComponent(LotTable);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LotTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('lotes', []);
    expect(component).toBeTruthy();
  });

  it('should calculate pagination computed properties correctly', () => {
    const fixture = TestBed.createComponent(LotTable);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('lotes', [
      { id: 1 }, { id: 2 }, { id: 3 }
    ]);
    component.filasPorPagina.set(2);
    component.paginaActual.set(0);

    expect(component.primerRegistro()).toBe(1);
    expect(component.ultimoRegistro()).toBe(2);
    expect(component.paginados().length).toBe(2);

    component.onPageChange({ page: 1, rows: 2 });
    expect(component.paginaActual()).toBe(1);
    expect(component.primerRegistro()).toBe(3);
    expect(component.ultimoRegistro()).toBe(3);
    expect(component.paginados().length).toBe(1);
  });

  it('should return correct badge state stylings', () => {
    const optimal = component.getBadgeEstado('óptimo');
    expect(optimal.badge).toContain('emerald');

    const warning = component.getBadgeEstado('por vencer');
    expect(warning.badge).toContain('amber');

    const expired = component.getBadgeEstado('vencido');
    expect(expired.badge).toContain('rose');

    const fallback = component.getBadgeEstado('unknown');
    expect(fallback.badge).toContain('slate');
  });
});
