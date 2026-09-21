import { TestBed } from '@angular/core/testing';
import { AuthService, UserData } from './auth.service';
import { Api } from '../api/api';
import { Router } from '@angular/router';
import { MockApi } from '../shared/utils/test-helpers';
import { vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';

describe('AuthService', () => {
  let service: AuthService;
  let mockApi: MockApi;
  let mockRouter: any;

  beforeEach(() => {
    mockApi = new MockApi();
    mockRouter = {
      navigate: vi.fn(),
    };

    localStorage.clear();
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Api, useValue: mockApi },
        { provide: Router, useValue: mockRouter },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load initial user from storage', () => {
    const user: UserData = { firstName: 'Juan', surName: 'Perez', email: 'juan@test.com', role: 'USER' };
    localStorage.setItem('current_user', JSON.stringify(user));

    // Instantiate new service under injection context to test constructor loading
    let newService!: AuthService;
    const injector = TestBed.inject(Injector);
    runInInjectionContext(injector, () => {
      newService = new AuthService();
    });
    expect(newService.currentUser()).toEqual(user);
  });

  it('should return null for invalid user JSON in storage', () => {
    localStorage.setItem('current_user', '{invalid-json');
    const newService = TestBed.inject(AuthService);
    expect(newService.currentUser()).toBeNull();
  });

  it('should register activity', () => {
    const prevActivity = (service as any).lastActivity;
    // Wait a tiny bit and update activity
    service.registerActivity();
    expect((service as any).lastActivity).toBeGreaterThanOrEqual(prevActivity);
  });

  it('should save session to storage and update signals', () => {
    const user: UserData = { firstName: 'Maria', surName: 'Gomez', email: 'maria@test.com', role: 'ADMIN' };
    service.saveSession(user, 'token-123');

    expect(localStorage.getItem('auth_token')).toBe('token-123');
    expect(localStorage.getItem('current_user')).toContain('maria@test.com');
    expect(sessionStorage.getItem('loggedIn')).toBe('true');
    expect(service.currentUser()).toEqual(user);
  });

  it('should get tokens', () => {
    localStorage.setItem('auth_token', 'jwt');
    localStorage.setItem('refresh_token', 'refresh');

    expect(service.getToken()).toBe('jwt');
    expect(service.getRefreshToken()).toBe('refresh');
  });

  it('should update current user partially', () => {
    const user: UserData = { firstName: 'Juan', surName: 'Perez', email: 'juan@test.com', role: 'USER' };
    service.currentUser.set(user);
    localStorage.setItem('current_user', JSON.stringify(user));

    service.updateCurrentUser({ cellPhone: '999888777' });
    expect(service.currentUser()?.cellPhone).toBe('999888777');
    expect(service.currentUser()?.firstName).toBe('Juan');
  });

  it('should logout and clean session storage', () => {
    service.logout('inactivity');

    expect(localStorage.getItem('current_user')).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(sessionStorage.getItem('loggedIn')).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { reason: 'inactivity' }
    });
  });

  it('should login successfully and save session', async () => {
    const successBody = {
      type: 'success',
      firstName: 'Juan',
      surName: 'Perez',
      email: 'juan@test.com',
      role: 'ADMIN',
      token: 'jwt-ok',
      listMessage: ['Bienvenido']
    };
    mockApi.invoke$Response.mockResolvedValue({ body: successBody });

    const result = await service.login('juan@test.com', 'password');
    expect(result.ok).toBe(true);
    expect(result.message).toBe('Bienvenido');
    expect(service.currentUser()).toEqual(successBody);
  });

  it('should return error when login fails', async () => {
    const errorBody = {
      type: 'error',
      listMessage: ['Credenciales inválidas']
    };
    mockApi.invoke$Response.mockResolvedValue({ body: errorBody });

    const result = await service.login('juan@test.com', 'badpass');
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Credenciales inválidas');
  });

  it('should handle login connection error', async () => {
    mockApi.invoke$Response.mockRejectedValue(new Error('Network error'));

    const result = await service.login('juan@test.com', 'pass');
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Error al conectar con el servidor.');
  });

  it('should resume session watcher if session is active', () => {
    localStorage.setItem('refresh_token', 'some-refresh');
    service.currentUser.set({ firstName: 'Test', surName: 'User', email: 'test@user.com', role: 'ADMIN' });

    vi.useFakeTimers();
    service.resumeSessionWatcher();

    expect((service as any).watcherIntervalId).not.toBeNull();
    vi.useRealTimers();
  });
});
