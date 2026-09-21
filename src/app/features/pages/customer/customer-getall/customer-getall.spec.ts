import { TestBed } from '@angular/core/testing';
import { CustomerGetall } from './customer-getall';
import { Api } from '../../../../api/api';
import { MockApi } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';

describe('CustomerGetall', () => {
  let component: CustomerGetall;
  let mockApi: MockApi;

  beforeEach(async () => {
    mockApi = new MockApi();

    mockApi.invoke$Response.mockImplementation((fn: any) => {
      if (fn && (fn.name === 'customerGetall' || fn.toString().includes('customerGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listCustomers: [
              { idCustomer: 1, name: 'Juan Perez', documentType: 'DNI', documentNumber: '12345678', createdAt: new Date().toISOString(), status: 'ACTIVO' },
              { idCustomer: 2, name: 'Empresa SAC', documentType: 'RUC', documentNumber: '20600000001', createdAt: new Date().toISOString(), status: 'ACTIVO' }
            ]
          }
        });
      }
      return Promise.resolve({ body: { type: 'success' } });
    });

    await TestBed.configureTestingModule({
      imports: [CustomerGetall],
      providers: [
        { provide: Api, useValue: mockApi }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(CustomerGetall);
    component = fixture.componentInstance;
  });

  it('should create and load customers', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.loading()).toBe(false);
    expect(component.clientes().length).toBe(2);
    expect(component.totalClientes()).toBe(2);
    expect(component.clientesHoy()).toBe(2);
    expect(component.conDni()).toBe(1);
    expect(component.conRuc()).toBe(1);
    expect(component.activos()).toBe(2);
    expect(component.otrosDocs()).toBe(0);
    expect(component.tiposDoc()).toEqual([
      { name: 'DNI', count: 1 },
      { name: 'RUC', count: 1 }
    ]);
  });

  it('should filter customers by search query and document type', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    component.onBusqueda('Empresa');
    expect(component.filtrados().length).toBe(1);
    expect(component.filtrados()[0].name).toBe('Empresa SAC');

    component.onBusqueda('');
    component.onTipoDocChange('DNI');
    expect(component.filtrados().length).toBe(1);
    expect(component.filtrados()[0].name).toBe('Juan Perez');

    component.onLimpiarFiltros();
    expect(component.busqueda()).toBe('');
    expect(component.tipoDocSeleccionado()).toBe('');
  });

  it('should handle API warning/error responses', async () => {
    mockApi.invoke$Response.mockResolvedValue({
      body: {
        type: 'error',
        listMessage: ['No se pudieron cargar los clientes']
      }
    });

    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.error()).toBe('No se pudieron cargar los clientes');
  });

  it('should handle API exception', async () => {
    mockApi.invoke$Response.mockRejectedValue(new Error('Network error'));

    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.error()).toBe('Error al cargar clientes.');
  });
});
