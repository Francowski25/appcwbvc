import { TestBed } from '@angular/core/testing';
import { SalesGetall } from './sales-getall';
import { Api } from '../../../../api/api';
import { Router } from '@angular/router';
import { MockApi } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';

describe('SalesGetall', () => {
  let component: SalesGetall;
  let mockApi: MockApi;
  let mockRouter: any;

  beforeEach(async () => {
    mockApi = new MockApi();
    mockRouter = {
      navigate: vi.fn()
    };

    mockApi.invoke$Response.mockImplementation((fn: any) => {
      if (fn && (fn.name === 'saleGetall' || fn.toString().includes('saleGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listSales: [
              { idSale: 's1', saleNumber: 'V-001', customerName: 'Ana', total: 100.0, status: 'Completada', paymentMethod: 'Efectivo', saleDate: new Date().toISOString() },
              { idSale: 's2', saleNumber: 'V-002', customerName: 'Juan', total: 50.0, status: 'Anulada', paymentMethod: 'Tarjeta', saleDate: new Date().toISOString() }
            ]
          }
        });
      }
      return Promise.resolve({ body: { type: 'success' } });
    });

    await TestBed.configureTestingModule({
      imports: [SalesGetall],
      providers: [
        { provide: Api, useValue: mockApi },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SalesGetall);
    component = fixture.componentInstance;
  });

  it('should create and load sales data', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.loading()).toBe(false);
    expect(component.ventas().length).toBe(2);
    expect(component.totalVentas()).toBe(2);
    expect(component.montoTotal()).toBe(100.0);
    expect(component.ventasHoy()).toBe(2);
    expect(component.montoHoy()).toBe(100.0);
    expect(component.ticketPromedio()).toBe(100.0);
    expect(component.ventasCompletadas()).toBe(1);
    expect(component.metodosPago()).toEqual([
      { name: 'Efectivo', count: 1 },
      { name: 'Tarjeta', count: 1 }
    ]);
  });

  it('should filter sales correctly', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    component.onBusqueda('Ana');
    expect(component.filtrados().length).toBe(1);

    component.onLimpiarFiltros();
    component.onMetodoPagoChange('Tarjeta');
    expect(component.filtrados().length).toBe(1);

    component.onEstadoChange('Completada');
    expect(component.filtrados().length).toBe(0);
  });

  it('should open details dialog and navigate to new sale', () => {
    const sale = { idSale: 's1', saleNumber: 'V-001' };
    component.onVerDetalle(sale);
    expect(component.ventaSeleccionada()).toEqual(sale);
    expect(component.showDetail()).toBe(true);

    component.onNuevaVenta();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/ventas/nueva']);
  });
});
