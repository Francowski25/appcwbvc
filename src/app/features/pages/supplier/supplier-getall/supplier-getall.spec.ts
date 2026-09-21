import { TestBed } from '@angular/core/testing';
import { SupplierGetall } from './supplier-getall';
import { Api } from '../../../../api/api';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MockApi, MockMessageService, MockConfirmationService } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';

describe('SupplierGetall', () => {
  let component: SupplierGetall;
  let mockApi: MockApi;
  let mockMessageService: MockMessageService;

  beforeEach(async () => {
    mockApi = new MockApi();
    mockMessageService = new MockMessageService();

    mockApi.invoke$Response.mockImplementation((fn: any) => {
      if (fn && (fn.name === 'supplierGetall' || fn.toString().includes('supplierGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listSuppliers: [
              { idSupplier: 's1', name: 'Supplier A', ruc: '123', email: 'a@b.com', status: 'activo' },
              { idSupplier: 's2', name: 'Supplier B', ruc: '', email: 'b@b.com', status: 'inactivo' }
            ]
          }
        });
      }
      return Promise.resolve({ body: { type: 'success' } });
    });

    await TestBed.configureTestingModule({
      imports: [SupplierGetall],
      providers: [
        { provide: Api, useValue: mockApi },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ConfirmationService, useValue: new MockConfirmationService() }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SupplierGetall);
    component = fixture.componentInstance;
  });

  it('should create and load suppliers data', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.loading()).toBe(false);
    expect(component.proveedores().length).toBe(2);
    expect(component.totalProveedores()).toBe(2);
    expect(component.activos()).toBe(1);
    expect(component.inactivos()).toBe(1);
    expect(component.conRuc()).toBe(1);
  });

  it('should filter correctly', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    component.onBusqueda('Supplier B');
    expect(component.filtrados().length).toBe(1);

    component.onLimpiarFiltros();
    component.onEstadoChange('activo');
    expect(component.filtrados().length).toBe(1);
  });

  it('should toggle status of supplier', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    mockApi.invoke$Response.mockResolvedValue({
      body: {
        type: 'success'
      }
    });

    const prov = component.proveedores()[0];
    component.onToggleStatus(prov);

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(prov.status).toBe('inactivo');
  });

  it('should handle edit and insert dialog states', () => {
    component.onNuevo();
    expect(component.proveedorSeleccionado()).toBeNull();
    expect(component.showForm()).toBe(true);

    const prov = { idSupplier: 's1' };
    component.onEditar(prov);
    expect(component.proveedorSeleccionado()).toEqual(prov);
    expect(component.showForm()).toBe(true);

    component.onGuardado();
    expect(component.showForm()).toBe(false);
  });
});
