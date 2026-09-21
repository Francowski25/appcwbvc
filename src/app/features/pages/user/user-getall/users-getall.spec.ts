import { TestBed } from '@angular/core/testing';
import { UsersGetall } from './users-getall';
import { Api } from '../../../../api/api';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MockApi, MockMessageService } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';
import { of } from 'rxjs';

describe('UsersGetall', () => {
  let component: UsersGetall;
  let mockApi: MockApi;
  let mockMessageService: MockMessageService;
  let mockConfirmationService: any;

  beforeEach(async () => {
    mockApi = new MockApi();
    mockMessageService = new MockMessageService();
    mockConfirmationService = {
      confirm: vi.fn((options: any) => {
        if (options.accept) options.accept();
      }),
      requireConfirmation$: of()
    };

    localStorage.setItem('current_user', JSON.stringify({ email: 'currentUser@test.com' }));

    mockApi.invoke$Response.mockImplementation((fn: any) => {
      if (fn && (fn.name === 'userGetall' || fn.toString().includes('userGetall'))) {
        return Promise.resolve({
          body: {
            type: 'success',
            listUsers: [
              { idUser: 1, firstName: 'Juan', surName: 'Perez', email: 'juan@test.com', role: 'Administrador', status: 'Activo' },
              { idUser: 2, firstName: 'Maria', surName: 'Gomez', email: 'maria@test.com', role: 'Vendedor', status: 'Inactivo' },
              { idUser: 3, firstName: 'CurrentUser', surName: 'Test', email: 'currentUser@test.com', role: 'Administrador', status: 'Activo' }
            ]
          }
        });
      }
      return Promise.resolve({ body: { type: 'success' } });
    });

    await TestBed.configureTestingModule({
      imports: [UsersGetall],
      providers: [
        { provide: Api, useValue: mockApi },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ConfirmationService, useValue: mockConfirmationService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(UsersGetall);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create and load users excluding current user', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.loading()).toBe(false);
    expect(component.usuarios().length).toBe(2);
    expect(component.totalUsuarios()).toBe(2);
    expect(component.totalesPorRol()).toEqual({ administrador: 1, quimico: 0, vendedor: 1 });
    expect(component.totalActivos()).toBe(1);
    expect(component.totalInactivos()).toBe(1);
  });

  it('should filter users by search queries and role / status dropdowns', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    component.onBusquedaChange('Maria');
    expect(component.filtrados().length).toBe(1);
    expect(component.filtrados()[0].firstName).toBe('Maria');

    component.onBusquedaChange('');
    component.rol.set('Administrador');
    expect(component.filtrados().length).toBe(1);
    expect(component.filtrados()[0].firstName).toBe('Juan');

    component.estado.set('inactivo');
    expect(component.filtrados().length).toBe(0);
  });

  it('should open edit and details dialogs', () => {
    const user = { idUser: 1, firstName: 'Juan' };
    component.onEditar(user);
    expect(component.usuarioSeleccionado()).toEqual(user);
    expect(component.showDetailsDialog()).toBe(true);

    component.onGuardarUsuario({ idUser: 1, firstName: 'Juan-edited', surName: 'Perez' });
    expect(component.showDetailsDialog()).toBe(false);
    expect(mockMessageService.add).toHaveBeenCalled();
  });

  it('should toggle user status', async () => {
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 100));

    mockApi.invoke$Response.mockResolvedValue({
      body: {
        type: 'success',
        listMessage: ['Estado cambiado.']
      }
    });

    const user = component.usuarios()[0]; // Juan (Activo)
    component.onToggleStatus(user);

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(user.status).toBe('inactivo');
  });

  it('should handle registrar / cancel insert user', () => {
    component.onCrearUsuario();
    expect(component.showInsertDialog()).toBe(true);

    component.onUsuarioRegistrado();
    expect(component.showInsertDialog()).toBe(false);
  });
});