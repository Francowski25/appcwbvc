import { TestBed } from '@angular/core/testing';
import { RolesPermissions } from './roles-permissions';

describe('RolesPermissions', () => {
  let component: RolesPermissions;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesPermissions]
    }).compileComponents();

    const fixture = TestBed.createComponent(RolesPermissions);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle permission flags correctly when role is selected', () => {
    component.selectedRol = { nombre: 'Administrador' };
    component.onRolSelect({});
    expect(component.permisosPorModulo[0].permisos[0].activo).toBe(true);

    component.selectedRol = { nombre: 'Vendedor' };
    component.onRolSelect({});
    expect(component.permisosPorModulo[0].permisos[0].activo).toBe(false);
    const ventNueva = component.permisosPorModulo.find(m => m.nombre === 'Ventas')?.permisos.find(p => p.id === 'vent_nueva');
    expect(ventNueva?.activo).toBe(true);

    component.selectedRol = { nombre: 'Químico Farmacéutico' };
    component.onRolSelect({});
    expect(component.permisosPorModulo[0].permisos[0].activo).toBe(true);
    const ventNuevaQuimico = component.permisosPorModulo.find(m => m.nombre === 'Ventas')?.permisos.find(p => p.id === 'vent_nueva');
    expect(ventNuevaQuimico?.activo).toBe(false);
  });

  it('should get severity based on status', () => {
    expect(component.getSeverity('Activo')).toBe('success');
    expect(component.getSeverity('Inactivo')).toBe('danger');
  });

  it('should call guardarPermiso without crash', () => {
    expect(() => component.guardarPermiso(1, 'prod_lista', true)).not.toThrow();
  });
});
