import { TestBed } from '@angular/core/testing';
import { MovementsKpi } from './movements-kpi';

describe('MovementsKpi', () => {
  let component: MovementsKpi;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovementsKpi]
    }).compileComponents();

    const fixture = TestBed.createComponent(MovementsKpi);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute KPI statistics correctly', () => {
    const fixture = TestBed.createComponent(MovementsKpi);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('movimientos', [
      { type: 'Entrada', userName: 'User A' },
      { type: 'Salida', userName: 'User B' },
      { type: 'Ajuste_Positivo', userName: 'User A' },
      { type: 'Ajuste_Negativo', userName: 'User C' }
    ]);
    fixture.detectChanges();

    expect(component.total()).toBe(4);
    expect(component.entradas()).toBe(1);
    expect(component.salidas()).toBe(1);
    expect(component.ajustesPositivos()).toBe(1);
    expect(component.ajustesNegativos()).toBe(1);
    expect(component.usuariosUnicos()).toBe(3);
  });
});
