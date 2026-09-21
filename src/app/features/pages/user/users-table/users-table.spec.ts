import { TestBed } from '@angular/core/testing';
import { UsersTable } from './users-table';
import { ConfirmationService } from 'primeng/api';
import { MockConfirmationService } from '../../../../shared/utils/test-helpers';
import { vi } from 'vitest';

describe('UsersTable', () => {
  let component: UsersTable;
  let mockConfirmationService: MockConfirmationService;

  beforeEach(async () => {
    mockConfirmationService = new MockConfirmationService();

    await TestBed.configureTestingModule({
      imports: [UsersTable],
      providers: [
        { provide: ConfirmationService, useValue: mockConfirmationService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(UsersTable);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format role label correctly', () => {
    expect(component.getRoleLabel('vendedor')).toBe('Vendedor');
    expect(component.getRoleLabel('quimico')).toBe('Químico');
    expect(component.getRoleLabel('administrador')).toBe('Administrador');
    expect(component.getRoleLabel('OTHER')).toBe('OTHER');
  });

  it('should confirm state change and emit event', () => {
    let toggledUser: any = null;
    component.cambiarEstado.subscribe(user => toggledUser = user);

    const dummyEvent = new Event('click');
    component.confirmarCambioEstado(dummyEvent, { firstName: 'Juan', surName: 'Perez', status: 'activo' });

    expect(mockConfirmationService.confirm).toHaveBeenCalled();
    expect(toggledUser).toEqual({ firstName: 'Juan', surName: 'Perez', status: 'activo' });
  });
});
