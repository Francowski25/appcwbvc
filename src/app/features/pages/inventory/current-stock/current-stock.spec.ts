import { TestBed } from '@angular/core/testing';
import { CurrentStock } from './current-stock';
import { Api } from '../../../../api/api';
import { MockApi } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';

describe('CurrentStock', () => {
  let component: CurrentStock;
  let mockApi: MockApi;

  beforeEach(async () => {
    mockApi = new MockApi();

    mockApi.invoke$Response.mockImplementation((fn: any) => {
      if (fn && (fn.name === 'productGetall' || fn.toString().includes('productGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listProducts: [
              { idProduct: 1, name: 'Product A', totalStock: 5, stockMinimum: 10 },
              { idProduct: 2, name: 'Product B', totalStock: 0, stockMinimum: 5 },
              { idProduct: 3, name: 'Product C', totalStock: 20, stockMinimum: 10 }
            ]
          }
        });
      }
      return Promise.resolve({ body: { type: 'success' } });
    });

    await TestBed.configureTestingModule({
      imports: [CurrentStock],
      providers: [
        { provide: Api, useValue: mockApi }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(CurrentStock);
    component = fixture.componentInstance;
  });

  it('should create and load products and compute statistics', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.loading()).toBe(false);
    expect(component.totalProductos()).toBe(3);
    expect(component.agotados().length).toBe(1); // Product B
    expect(component.criticos().length).toBe(1); // Product A
    expect(component.enAlerta().length).toBe(2);
    expect(component.optimos().length).toBe(1); // Product C
    expect(component.saludInventario()).toBe(33); // (3 - 2) / 3 * 100 = 33%

    expect(component.top5Criticos()[0].name).toBe('Product B'); // sorted by totalStock ascending
  });

  it('should filter alerts and handle search inputs', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    component.busquedaTabla.set('Product A');
    expect(component.filtradosAlerta().length).toBe(1);

    component.onBusqueda({ target: { value: 'Product B' } } as any);
    expect(component.busquedaTabla()).toBe('Product B');
  });
});
