import { TestBed } from '@angular/core/testing';
import { MovementsNew } from './movements-new';
import { Api } from '../../../../../api/api';
import { AuthService } from '../../../../../services/auth.service';
import { MockApi, MockAuthService, MockMessageService } from '../../../../../shared/utils/test-helpers';
import { MessageService } from 'primeng/api';
import { vi } from 'vitest';

describe('MovementsNew', () => {
  let component: MovementsNew;
  let mockApi: MockApi;
  let mockAuthService: MockAuthService;
  let mockMessageService: MockMessageService;

  beforeEach(async () => {
    mockApi = new MockApi();
    mockAuthService = new MockAuthService();
    mockMessageService = new MockMessageService();

    mockApi.invoke$Response.mockImplementation((fn: any) => {
      if (fn && (fn.name === 'lotByproduct' || fn.toString().includes('lotByproduct'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listLots: [
              { idLot: 'l1', code: 'LOT-A', purchasePrice: 12.5, expirationDate: '2027-01-01' }
            ]
          }
        });
      }
      return Promise.resolve({ body: { type: 'success' } });
    });

    await TestBed.configureTestingModule({
      imports: [MovementsNew],
      providers: [
        { provide: Api, useValue: mockApi },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MessageService, useValue: mockMessageService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(MovementsNew);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should step through pages and select type', () => {
    component.seleccionarTipo('Salida');
    expect(component.tipoMovimiento()).toBe('Salida');

    component.siguientePaso();
    expect(component.pasoActual()).toBe(2);
  });

  it('should handle product input changes and select catalog product', async () => {
    let searchVal = '';
    component.onSearchProduct.subscribe(v => searchVal = v);

    component.onInputProducto({ target: { value: 'Aspirina' } } as any);
    expect(component.productoBusqueda()).toBe('Aspirina');
    expect(searchVal).toBe('Aspirina');

    component.seleccionarProductoCatalogo({ idProduct: 'p1', name: 'Aspirina', cost: 10.0 });
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.productoSeleccionado()).toBeDefined();
    expect(component.lotesProducto().length).toBe(1);
    expect(component.loteSeleccionado()).toEqual(expect.objectContaining({ idLot: 'l1' }));
  });

  it('should add products to detail list and compute totals', async () => {
    component.seleccionarProductoCatalogo({ idProduct: 'p1', name: 'Aspirina', cost: 10.0 });
    await new Promise(resolve => setTimeout(resolve, 100));

    component.cantidad.set(5);
    component.costoUnitario.set(10.0);
    expect(component.puedeAgregarProducto()).toBe(true);

    component.agregarProducto();
    expect(component.listaDetalle().length).toBe(1);
    expect(component.costoTotalCalculado()).toBe(50.0);

    component.eliminarItem(0);
    expect(component.listaDetalle().length).toBe(0);
  });

  it('should emit saved payload and close modal', async () => {
    component.seleccionarProductoCatalogo({ idProduct: 'p1', name: 'Aspirina', cost: 10.0 });
    await new Promise(resolve => setTimeout(resolve, 100));

    component.cantidad.set(5);
    component.costoUnitario.set(10.0);
    component.agregarProducto();

    let savedPayload: any = null;
    component.saved.subscribe(p => savedPayload = p);

    component.observacion.set('Test observation');
    component.guardarMovimiento();

    expect(savedPayload).toEqual(expect.objectContaining({
      type: 'Entrada',
      observation: 'Test observation',
      details: expect.arrayContaining([
        expect.objectContaining({
          idProduct: 'p1',
          idLot: 'l1',
          quantity: 5,
          unitCost: 10.0
        })
      ])
    }));
  });
});
