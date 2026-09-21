import { TestBed } from '@angular/core/testing';
import { PurchaseGetall } from './purchase-getall';
import { Api } from '../../../../api/api';
import { MockApi } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';

describe('PurchaseGetall', () => {
  let component: PurchaseGetall;
  let mockApi: MockApi;

  beforeEach(async () => {
    mockApi = new MockApi();

    mockApi.invoke$Response.mockImplementation((fn: any) => {
      if (fn && (fn.name === 'purchaseGetall' || fn.toString().includes('purchaseGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listPurchases: [
              { idPurchase: 'p1', supplierName: 'Supplier A', costoTotal: 100.0, observation: 'First purchase' },
              { idPurchase: 'p2', supplierName: 'Supplier B', costoTotal: 250.0, observation: 'Urgent stock' }
            ]
          }
        });
      }
      return Promise.resolve({ body: { type: 'success' } });
    });

    await TestBed.configureTestingModule({
      imports: [PurchaseGetall],
      providers: [
        { provide: Api, useValue: mockApi }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PurchaseGetall);
    component = fixture.componentInstance;
  });

  it('should create and load purchase data', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.loading()).toBe(false);
    expect(component.compras().length).toBe(2);
    expect(component.totalCompras()).toBe(2);
    expect(component.montoTotal()).toBe(350.0);
    expect(component.proveedoresDistintos()).toBe(2);
    expect(component.promedioPorCompra()).toBe(175.0);
    expect(component.proveedores()).toEqual([
      { name: 'Supplier A', count: 1 },
      { name: 'Supplier B', count: 1 }
    ]);
  });

  it('should filter purchases correctly', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    component.onBusqueda('Urgent');
    expect(component.filtrados().length).toBe(1);

    component.onLimpiarFiltros();
    component.onProveedorChange('Supplier A');
    expect(component.filtrados().length).toBe(1);
  });

  it('should open details dialog', () => {
    const purchase = { idPurchase: 'p1' };
    component.onVerDetalle(purchase);
    expect(component.compraSeleccionada()).toEqual(purchase);
    expect(component.showDetalle()).toBe(true);
  });

  it('should show new purchase modal and trigger load on created', async () => {
    component.onNuevaCompra();
    expect(component.showNuevaCompra()).toBe(true);

    component.onCompraCreada();
    expect(component.showNuevaCompra()).toBe(false);
  });
});
