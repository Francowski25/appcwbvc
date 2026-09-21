import { TestBed } from '@angular/core/testing';
import { UsersSidebar } from './users-sidebar';

describe('UsersSidebar', () => {
  let component: UsersSidebar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersSidebar]
    }).compileComponents();

    const fixture = TestBed.createComponent(UsersSidebar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit changes when role or status is selected', () => {
    let role = '';
    let estado = '';
    component.roleChange.subscribe(v => role = v);
    component.estadoChange.subscribe(v => estado = v);

    component.seleccionarRol('vendedor');
    component.seleccionarEstado('activo');

    expect(role).toBe('vendedor');
    expect(estado).toBe('activo');
  });
});
