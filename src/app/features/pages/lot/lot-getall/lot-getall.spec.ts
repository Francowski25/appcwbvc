import { TestBed } from '@angular/core/testing';
import { LotGetall } from './lot-getall';
import { Api } from '../../../../api/api';
import { MockApi } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';

describe('LotGetall', () => {
  let component: LotGetall;
  let mockApi: MockApi;

  beforeEach(async () => {
    mockApi = new MockApi();

    mockApi.invoke$Response.mockImplementation((fn: any) => {
      if (fn && (fn.name === 'lotGetall' || fn.toString().includes('lotGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listLots: [
              { code: 'L1', supplierName: 'Prov A', expirationStatus: 'Vigente', currentStock: 10, purchasePrice: 100 },
              { code: 'L2', supplierName: 'Prov B', expirationStatus: 'Por vencer', currentStock: 0, purchasePrice: 50 }
            ]
          }
        });
      }
      return Promise.resolve({ body: { type: 'success' } });
    });

    await TestBed.configureTestingModule({
      imports: [LotGetall],
      providers: [
        { provide: Api, useValue: mockApi }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(LotGetall);
    component = fixture.componentInstance;
  });

  it('should create and load lotes', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.loading()).toBe(false);
    expect(component.lotes().length).toBe(2);
    expect(component.totalLotes()).toBe(2);
    expect(component.optimos()).toBe(1);
    expect(component.porVencer()).toBe(1);
    expect(component.agotados()).toBe(1);
    expect(component.valorAlmacen()).toBe(1000);
    expect(component.proveedores()).toEqual([
      { name: 'Prov A', count: 1 },
      { name: 'Prov B', count: 1 }
    ]);
    expect(component.estados()).toEqual([
      { name: 'Vigente', count: 1 },
      { name: 'Por vencer', count: 1 }
    ]);
  });

  it('should filter lots by search input and dropdown selects', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    component.onBusqueda('L1');
    expect(component.filtrados().length).toBe(1);

    component.onBusqueda('');
    component.onProveedorChange('Prov B');
    expect(component.filtrados().length).toBe(1);

    component.onEstadoChange('Vigente');
    expect(component.filtrados().length).toBe(0);
  });

  it('should handle API failures', async () => {
    mockApi.invoke$Response.mockResolvedValue({
      body: {
        type: 'error',
        listMessage: ['Server issue']
      }
    });

    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.error()).toBe('Server issue');
  });

  it('should handle API rejection', async () => {
    mockApi.invoke$Response.mockRejectedValue(new Error('Network offline'));

    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.error()).toBe('Error al cargar lotes.');
  });
});
