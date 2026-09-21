import { TestBed } from '@angular/core/testing';
import { SellerDashboard } from './seller-dashboard';
import { Api } from '../../../api/api';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MockApi, MockAuthService } from '../../../shared/utils/test-helpers';
import { vi } from 'vitest';

describe('SellerDashboard', () => {
  let component: SellerDashboard;
  let mockApi: MockApi;
  let mockRouter: any;
  let mockAuthService: MockAuthService;

  beforeEach(async () => {
    mockApi = new MockApi();
    mockRouter = {
      navigate: vi.fn()
    };
    mockAuthService = new MockAuthService();

    mockAuthService.currentUser.set({
      firstName: 'Juan',
      surName: 'Perez',
      email: 'juan@test.com',
      role: 'SELLER'
    });

    mockApi.invoke$Response.mockImplementation((fn: any) => {
      // Check both function references and name property depending on bundler environment
      if (fn && (fn.name === 'saleGetall' || fn.toString().includes('saleGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listSales: [
              { idSale: '1', userName: 'Juan Perez', userEmail: 'juan@test.com', total: 100, status: 'Completada', saleDate: new Date().toISOString() },
              { idSale: '2', userName: 'Juan Perez', userEmail: 'juan@test.com', total: 50, status: 'Completada', saleDate: new Date().toISOString() }
            ]
          }
        });
      }
      if (fn && (fn.name === 'productGetall' || fn.toString().includes('productGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listProducts: [
              { idProduct: 1, name: 'Prod A', totalStock: 5, stockMinimum: 10 },
              { idProduct: 2, name: 'Prod B', totalStock: 20, stockMinimum: 5 }
            ]
          }
        });
      }
      return Promise.resolve({ body: { type: 'success' } });
    });

    await TestBed.configureTestingModule({
      imports: [SellerDashboard],
      providers: [
        { provide: Api, useValue: mockApi },
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(SellerDashboard);
    component = fixture.componentInstance;
  });

  it('should create and load data', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100)); // wait for promise resolution

    expect(component.loading()).toBe(false);
    expect(component.ventas().length).toBe(2);
    expect(component.productos().length).toBe(2);

    expect(component.misVentas().length).toBe(2);
    expect(component.misVentasHoyCount()).toBe(2);
    expect(component.montoHoy()).toBe(150);
    expect(component.ticketPromedio()).toBe(75);
    expect(component.stockCritico()).toBe(1);
    expect(component.alertasStock().length).toBe(1);
  });

  it('should format date to hour string', () => {
    const dateStr = '2026-08-04T15:30:00Z';
    const hour = component.getHora(dateStr);
    expect(hour).toBeTruthy();
  });

  it('should navigate to different sales pages', () => {
    component.irANuevaVenta();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['seller/sales/new']);

    component.irAClientes();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['seller/customers']);

    component.irACatalogo();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['seller/sales/catalogo']);

    component.irAHistorial();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['seller/sales/history']);
  });
});
