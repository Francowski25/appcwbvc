import { TestBed } from '@angular/core/testing';
import { LaboratoryTable } from './laboratory-table';
import { ConfirmationService } from 'primeng/api';
import { MockConfirmationService } from '../../../../shared/utils/test-helpers';

describe('LaboratoryTable', () => {
  let component: LaboratoryTable;
  let mockConfirmationService: MockConfirmationService;

  beforeEach(async () => {
    mockConfirmationService = new MockConfirmationService();

    await TestBed.configureTestingModule({
      imports: [LaboratoryTable],
      providers: [
        { provide: ConfirmationService, useValue: mockConfirmationService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(LaboratoryTable);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LaboratoryTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('laboratorios', []);
    expect(component).toBeTruthy();
  });

  it('should handle pagination correctly', () => {
    const fixture = TestBed.createComponent(LaboratoryTable);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('laboratorios', [
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

  it('should trigger status change confirmation', () => {
    let toggledLab: any = null;
    component.onToggleStatus.subscribe(lab => toggledLab = lab);

    const testLab = { name: 'Lab A', status: 'Activo' };
    component.confirmarCambioEstado(new Event('click'), testLab);

    expect(mockConfirmationService.confirm).toHaveBeenCalled();
    expect(toggledLab).toEqual(testLab);
  });
});
