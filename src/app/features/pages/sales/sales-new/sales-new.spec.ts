import { TestBed } from '@angular/core/testing';
import { SalesNew } from './sales-new';
import { Api } from '../../../../api/api';
import { MessageService } from 'primeng/api';
import { ExportService } from '../../../../services/export.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MockApi, MockMessageService, MockExportService } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';

describe('SalesNew', () => {
  let component: SalesNew;
  let mockApi: MockApi;
  let mockMessageService: MockMessageService;
  let mockExportService: MockExportService;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    mockApi = new MockApi();
    mockMessageService = new MockMessageService();
    mockExportService = new MockExportService();

    mockApi.invoke$Response.mockImplementation((fn: any, params?: any) => {
      if (fn && (fn.name === 'customerGetall' || fn.toString().includes('customerGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listCustomers: [{ idCustomer: 'c1', name: 'Ana Perez', documentType: 'DNI', documentNumber: '12345678' }]
          }
        });
      }
      if (fn && (fn.name === 'productGetall' || fn.toString().includes('productGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listProducts: [{ idProduct: 'p1', name: 'Paracetamol', barcode: '888', priceSale: '2.5' }]
          }
        });
      }
      if (fn && (fn.name === 'lotByproduct' || fn.toString().includes('lotByproduct'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listLots: [{ idLot: 'l1', code: 'LOT-A', currentStock: 10 }]
          }
        });
      }
      return Promise.resolve({ body: { type: 'success' } });
    });

    await TestBed.configureTestingModule({
      imports: [SalesNew],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Api, useValue: mockApi },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ExportService, useValue: mockExportService }
      ]
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(SalesNew);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create and load data', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.loadingData()).toBe(false);
    expect(component.clientes().length).toBe(1);
    expect(component.productos().length).toBe(1);
  });

  it('should trigger reniec validation for DNI', async () => {
    component.onDocumentTypeChange('DNI');
    component.onDocumentNumberInput('12345678');

    await new Promise(resolve => setTimeout(resolve, 450));

    const req = httpTestingController.expectOne(req => req.url.includes('/api/reniec/12345678'));
    expect(req.request.method).toBe('GET');
    req.flush({
      first_name: 'Carlos',
      first_last_name: 'Paz',
      second_last_name: 'Solis',
      full_name: 'Carlos Paz Solis'
    });

    expect(component.nuevoCliente().name).toBe('Carlos Paz Solis');
  });

  it('should search clients correctly', () => {
    component.onBusquedaCliente({ target: { value: '123' } } as any);
    expect(component.busquedaCliente()).toBe('123');
    expect(component.showCustomerSearch()).toBe(true);

    component.onLimpiarBusquedaCliente();
    expect(component.busquedaCliente()).toBe('');
    expect(component.showCustomerSearch()).toBe(false);
  });

  it('should add products and calculate totals', async () => {
    const prod = { idProduct: 'p1', name: 'Paracetamol', priceSale: 2.5 };
    await component.onAgregarProducto(prod);

    expect(component.items().length).toBe(1);
    expect(component.subtotal()).toBe(2.5);

    component.onCambiarCantidad(0, 5);
    expect(component.items()[0].quantity).toBe(5);
    expect(component.subtotal()).toBe(12.5);

    component.onDescuento({ target: { value: '2.5' } } as any);
    expect(component.descuento()).toBe(2.5);
    expect(component.base()).toBe(10);
    expect(component.igv()).toBe(1.8);
    expect(component.total()).toBe(11.8);

    component.onEliminarItem(0);
    expect(component.items().length).toBe(0);
  });

  it('should submit sale successfully', async () => {
    const dummyWindow = {
      document: {
        write: vi.fn()
      },
      close: vi.fn()
    };
    vi.spyOn(window, 'open').mockReturnValue(dummyWindow as any);

    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    const prod = { idProduct: 'p1', name: 'Paracetamol', priceSale: 2.5 };
    await component.onAgregarProducto(prod);

    mockApi.invoke$Response.mockResolvedValue({
      body: {
        type: 'success',
        idSale: 's-new-123'
      }
    });

    localStorage.setItem('current_user', JSON.stringify({ idUser: 'u1' }));

    await component.onGuardar();

    expect(mockApi.invoke$Response).toHaveBeenCalled();
    expect(mockExportService.generarPDFConPestana).toHaveBeenCalled();
    expect(component.items().length).toBe(0);

    localStorage.clear();
  });
});
