import { TestBed } from '@angular/core/testing';
import { Sidebar } from './sidebar';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { LayoutService } from '../../../../services/layout.service';
import { MockLayoutService } from '../../../../shared/utils/test-helpers';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

describe('Sidebar', () => {
  let component: Sidebar;
  let mockLayoutService: MockLayoutService;
  let mockRouter: any;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    mockLayoutService = new MockLayoutService();
    routerEventsSubject = new Subject<any>();
    mockRouter = {
      events: routerEventsSubject.asObservable(),
      navigate: vi.fn()
    };

    localStorage.setItem('current_user', JSON.stringify({ firstName: 'Juan', email: 'juan@test.com' }));

    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map() } } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.user).toEqual({ firstName: 'Juan', email: 'juan@test.com' });
  });

  it('should toggle collapse state', () => {
    expect(component.collapsed()).toBe(false);
    component.toggle();
    expect(component.collapsed()).toBe(true);
  });

  it('should toggle section open state', () => {
    expect(component.openSection()).toBeNull();
    component.toggleSection('ventas');
    expect(component.openSection()).toBe('ventas');
    expect(component.isSectionOpen('ventas')).toBe(true);
    component.toggleSection('ventas');
    expect(component.openSection()).toBeNull();
  });

  it('should toggle user menu', () => {
    expect(component.userMenuOpen()).toBe(false);
    component.toggleUserMenu();
    expect(component.userMenuOpen()).toBe(true);
  });

  it('should close user menu on click outside', () => {
    component.userMenuOpen.set(true);
    const mockEvent = {
      target: {
        closest: (selector: string) => null
      }
    } as unknown as MouseEvent;
    component.onDocumentClick(mockEvent);
    expect(component.userMenuOpen()).toBe(false);
  });

  it('should logout and navigate to root', () => {
    component.logout();
    expect(localStorage.getItem('current_user')).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should close sidebar layout on navigation end', () => {
    routerEventsSubject.next(new NavigationEnd(1, '/seller/dashboard', '/seller/dashboard'));
    expect(mockLayoutService.close).toHaveBeenCalled();
  });
});
