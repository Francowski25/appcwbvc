import { TestBed, ComponentFixture } from '@angular/core/testing';
import { SupplierTable } from './supplier-table';
import { ConfirmationService } from 'primeng/api';
import { MockConfirmationService } from '../../../../shared/utils/test-helpers';

describe('SupplierTable', () => {
  let component: SupplierTable;
  let fixture: ComponentFixture<SupplierTable>;
  let mockConfirmationService: MockConfirmationService;

  beforeEach(async () => {
    mockConfirmationService = new MockConfirmationService();

    await TestBed.configureTestingModule({
      imports: [SupplierTable],
      providers: [
        { provide: ConfirmationService, useValue: mockConfirmationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('proveedores', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle pagination and counts', () => {
    fixture.componentRef.setInput('proveedores', [
      { name: 'Prov A' }, { name: 'Prov B' }
    ]);
    fixture.detectChanges();

    expect(component.textoConteo()).toBe('2 proveedores encontrados');

    component.onPageChange({ page: 1, rows: 1 });
    expect(component.paginaActual()).toBe(1);
    expect(component.filasPorPagina()).toBe(1);
  });

  it('should return correct gradient class', () => {
    expect(component.getGradientClass('Supplier A')).toBeTruthy();
    expect(component.getGradientClass('')).toBeTruthy();
  });

  it('should trigger state change confirmation', () => {
    let toggled: any = null;
    component.toggleStatus.subscribe(val => toggled = val);

    const testProv = { name: 'Prov A', status: 'Activo' };
    component.confirmarCambioEstado(new Event('click'), testProv);

    expect(mockConfirmationService.confirm).toHaveBeenCalled();
    expect(toggled).toEqual(testProv);
  });
});
