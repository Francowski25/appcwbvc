import { TestBed } from '@angular/core/testing';
import { ProductGetall } from './product-getall';
import { Api } from '../../../../api/api';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MockApi, MockMessageService, MockConfirmationService } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';

describe('ProductGetall', () => {
  let component: ProductGetall;
  let mockApi: MockApi;
  let mockMessageService: MockMessageService;
  let mockConfirmationService: MockConfirmationService;

  beforeEach(async () => {
    mockApi = new MockApi();
    mockMessageService = new MockMessageService();
    mockConfirmationService = new MockConfirmationService();

    mockApi.invoke$Response.mockImplementation((fn: any) => {
      if (fn && (fn.name === 'productGetall' || fn.toString().includes('productGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listProducts: [
              { idProduct: 1, name: 'Paracetamol', category: 'Fármacos', laboratory: 'Lab A', totalStock: 50, priceSale: 2.5, hasDiscount: true },
              { idProduct: 2, name: 'Crema Hidratante', category: 'Cosméticos', laboratory: 'Lab B', totalStock: 0, priceSale: 15.0, hasDiscount: false }
            ]
          }
        });
      }
      return Promise.resolve({ body: { type: 'success' } });
    });

    await TestBed.configureTestingModule({
      imports: [ProductGetall],
      providers: [
        { provide: Api, useValue: mockApi },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ConfirmationService, useValue: mockConfirmationService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ProductGetall);
    component = fixture.componentInstance;
  });

  it('should create and load products', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.loading()).toBe(false);
    expect(component.productos().length).toBe(2);
    expect(component.totalProductosQty()).toBe(2);
    expect(component.totalCategoriasQty()).toBe(2);
    expect(component.totalLaboratoriosQty()).toBe(2);
    expect(component.productosAgotadosQty()).toBe(1);
    expect(component.valorInventarioMonto()).toBe(125.0);
    expect(component.promocionesActivasQty()).toBe(1);
  });

  it('should filter products by category, laboratory and search queries', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    component.onBusqueda('Paracetamol');
    expect(component.filtrados().length).toBe(1);

    component.onBusqueda('');
    component.onCategoriaChange('Cosméticos');
    expect(component.filtrados().length).toBe(1);

    component.onLaboratorioChange('Lab A');
    expect(component.filtrados().length).toBe(0);
  });

  it('should select product and trigger details dialog', () => {
    const prod = { idProduct: 1, name: 'Paracetamol' };
    component.onSeleccionar(prod);
    expect(component.productoSeleccionado()).toEqual(prod);
    expect(component.showDetails()).toBe(true);
  });

  it('should trigger update product list on onEditarProducto', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    const updated = { idProduct: 1, name: 'Paracetamol-edited', category: 'Fármacos', laboratory: 'Lab A' };
    component.onEditarProducto(updated);

    expect(component.productos()[0].name).toBe('Paracetamol-edited');
    expect(component.showDetails()).toBe(false);
  });

  it('should show create modal and handle registrars', () => {
    component.onCrearProducto();
    expect(component.showCreate()).toBe(true);

    component.onProductoRegistrado();
    expect(component.showCreate()).toBe(false);
  });

  it('should handle API errors', async () => {
    mockApi.invoke$Response.mockResolvedValue({
      body: {
        type: 'error',
        listMessage: ['Load failed']
      }
    });

    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.error()).toBe('Load failed');
  });
});
