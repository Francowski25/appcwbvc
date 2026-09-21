import { TestBed } from '@angular/core/testing';
import { PurchaseNew } from './purchase-new';
import { Api } from '../../../../api/api';
import { MockApi } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';

describe('PurchaseNew', () => {
  let component: PurchaseNew;
  let mockApi: MockApi;

  beforeEach(async () => {
    mockApi = new MockApi();

    mockApi.invoke$Response.mockImplementation((fn: any) => {
      if (fn && (fn.name === 'supplierGetall' || fn.toString().includes('supplierGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listSuppliers: [{ idSupplier: 's1', name: 'Supplier A' }]
          }
        });
      }
      if (fn && (fn.name === 'productGetall' || fn.toString().includes('productGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listProducts: [{ idProduct: 'p1', name: 'Product A' }]
          }
        });
      }
      return Promise.resolve({ body: { type: 'success' } });
    });

    await TestBed.configureTestingModule({
      imports: [PurchaseNew],
      providers: [
        { provide: Api, useValue: mockApi }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PurchaseNew);
    component = fixture.componentInstance;
  });

  it('should create and load suppliers / products catalogs', async () => {
    expect(component).toBeTruthy();
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(component.proveedores().length).toBe(1);
    expect(component.productos().length).toBe(1);
  });

  it('should add and remove items, computing totals correctly', () => {
    component.agregarItem();
    expect(component.items().length).toBe(1);

    component.items.update(list => {
      list[0].quantity = 10;
      list[0].unitCost = 15;
      return [...list];
    });

    expect(component.totalUnidades()).toBe(10);
    expect(component.costoTotal()).toBe(150);

    component.quitarItem(0);
    expect(component.items().length).toBe(0);
  });

  it('should reset form and emit visibleChange on cerrar', () => {
    let closed = true;
    component.visibleChange.subscribe(v => closed = v);

    component.idSupplier.set('s1');
    component.cerrar();

    expect(closed).toBe(false);
    expect(component.idSupplier()).toBeNull();
  });
});
