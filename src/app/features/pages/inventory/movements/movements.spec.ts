import { TestBed } from '@angular/core/testing';
import { Movements } from './movements';
import { Api } from '../../../../api/api';
import { MockApi, MockAuthService, MockMessageService } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../services/auth.service';

describe('Movements', () => {
  let component: Movements;
  let mockApi: MockApi;

  beforeEach(async () => {
    mockApi = new MockApi();

    mockApi.invoke$Response.mockImplementation((fn: any, params: any) => {
      if (fn && (fn.name === 'movementGetall' || fn.toString().includes('movementGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listMovements: [
              { idMovement: 'm1', type: 'Ingreso', userName: 'User A', cost: 120.0, observation: 'Initial entry' },
              { idMovement: 'm2', type: 'Salida', userName: 'User B', cost: 80.0, observation: 'Sale items' }
            ]
          }
        });
      }
      if (fn && (fn.name === 'movementDetail' || fn.toString().includes('movementDetail'))) {
        return Promise.resolve({
          body: {
            idMovement: params.idMovement,
            detail: 'Some description detail'
          }
        });
      }
      if (fn && (fn.name === 'kardexProduct' || fn.toString().includes('kardexProduct'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            kardex: []
          }
        });
      }
      if (fn && (fn.name === 'productSearch' || fn.toString().includes('productSearch'))) {
        return Promise.resolve({
          body: {
            listProducts: [{ idProduct: 'p1', name: 'Product X' }]
          }
        });
      }
      return Promise.resolve({ body: { type: 'success' } });
    });

    await TestBed.configureTestingModule({
      imports: [Movements],
      providers: [
        { provide: Api, useValue: mockApi },
        { provide: MessageService, useValue: new MockMessageService() },
        { provide: AuthService, useValue: new MockAuthService() }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(Movements);
    component = fixture.componentInstance;
  });

  it('should create and load movements data', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.loadingList()).toBe(false);
    expect(component.movimientos().length).toBe(2);
    expect(component.totalMovimientosQty()).toBe(2);
    expect(component.totalCostoMonto()).toBe(200.0);
  });

  it('should filter movements correctly', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    component.tipoSeleccionado.set('Ingreso');
    expect(component.filtrados().length).toBe(1);

    component.onResetFiltros();
    expect(component.tipoSeleccionado()).toBe('');

    component.busqueda.set('Sale');
    expect(component.filtrados().length).toBe(1);
  });

  it('should retrieve detail on cargarDetalle', async () => {
    component.cargarDetalle('m1');
    expect(component.loadingDetail()).toBe(true);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.detalleMovimiento()).toEqual(expect.objectContaining({
      idMovement: 'm1',
      detail: 'Some description detail'
    }));
    expect(component.loadingDetail()).toBe(false);
  });

  it('should retrieve kardex on cargarKardexProducto', async () => {
    component.cargarKardexProducto('p1');
    expect(component.loadingKardex()).toBe(true);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.kardexProductoData()).toBeDefined();
    expect(component.loadingKardex()).toBe(false);
  });

  it('should search products and create movements', async () => {
    component.buscarProductosBackend('query');
    expect(component.buscandoProductos()).toBe(true);

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.resultadosBusquedaProductos().length).toBe(1);

    component.abrirModalCrearMovimiento();
    expect(component.mostrarCrearMovimiento()).toBe(true);

    component.crearMovimientoBackend({ type: 'Ingreso', listDetails: [] } as any);
    expect(component.guardandoMovimiento()).toBe(true);

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(component.mostrarCrearMovimiento()).toBe(false);
  });
});
