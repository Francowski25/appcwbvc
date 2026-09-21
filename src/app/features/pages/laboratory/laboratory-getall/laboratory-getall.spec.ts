import { TestBed } from '@angular/core/testing';
import { LaboratoryGetall } from './laboratory-getall';
import { Api } from '../../../../api/api';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MockApi, MockMessageService, MockConfirmationService } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';
import { of } from 'rxjs';

describe('LaboratoryGetall', () => {
  let component: LaboratoryGetall;
  let mockApi: MockApi;
  let mockMessageService: MockMessageService;
  let mockConfirmationService: MockConfirmationService;

  beforeEach(async () => {
    mockApi = new MockApi();
    mockMessageService = new MockMessageService();
    mockConfirmationService = new MockConfirmationService();

    mockApi.invoke$Response.mockImplementation((fn: any) => {
      if (fn && (fn.name === 'laboratoryGetall' || fn.toString().includes('laboratoryGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listLaboratories: [
              { idLaboratory: 1, name: 'Lab A', status: 'Activo' },
              { idLaboratory: 2, name: 'Lab B', status: 'Inactivo' }
            ]
          }
        });
      }
      if (fn && (fn.name === 'productGetall' || fn.toString().includes('productGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listProducts: [{ idProduct: 1, name: 'Product A' }]
          }
        });
      }
      return Promise.resolve({ body: { type: 'success' } });
    });

    await TestBed.configureTestingModule({
      imports: [LaboratoryGetall],
      providers: [
        { provide: Api, useValue: mockApi },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ConfirmationService, useValue: mockConfirmationService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(LaboratoryGetall);
    component = fixture.componentInstance;
  });

  it('should create and load data', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.loading()).toBe(false);
    expect(component.laboratories().length).toBe(2);
    expect(component.products().length).toBe(1);
    expect(component.totalLaboratories()).toBe(2);
    expect(component.totalActivas()).toBe(1);
    expect(component.totalInactivas()).toBe(1);
  });

  it('should filter laboratories correctly', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    component.onBusquedaChange('Lab B');
    expect(component.filtrados().length).toBe(1);

    component.onBusquedaChange('');
    component.onEstadoChange('activo');
    expect(component.filtrados().length).toBe(1);
  });

  it('should toggle status of laboratory', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    mockApi.invoke$Response.mockResolvedValue({
      body: {
        type: 'success',
        listMessage: ['Estado actualizado']
      }
    });

    const lab = component.laboratories()[0]; // Lab A (Activo)
    component.onToggleStatus(lab);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(lab.status).toBe('inactivo');
    expect(mockMessageService.add).toHaveBeenCalled();
  });

  it('should handle dialog flows', () => {
    component.onCrearLaboratorio();
    expect(component.showInsertDialog()).toBe(true);

    component.onLaboratorioRegistrado();
    expect(component.showInsertDialog()).toBe(false);

    const lab = { idLaboratory: 1 };
    component.onEditar(lab);
    expect(component.selectedLaboratory()).toEqual(lab);
    expect(component.showDetailDialog()).toBe(true);

    component.onLaboratorioDetallado();
    expect(component.showDetailDialog()).toBe(false);
  });
});
