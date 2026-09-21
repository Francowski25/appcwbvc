import { signal } from '@angular/core';
import { vi } from 'vitest';
import { of, Subject } from 'rxjs';

export class MockApi {
  private _rootUrl = 'http://localhost:8080/api';

  get rootUrl(): string {
    return this._rootUrl;
  }

  set rootUrl(val: string) {
    this._rootUrl = val;
  }

  invoke = vi.fn().mockImplementation(() => Promise.resolve({}));
  invoke$Response = vi.fn().mockImplementation(() => Promise.resolve({ body: { type: 'success' } }));
}

export class MockAuthService {
  currentUser = signal<any>({
    id: 1,
    firstName: 'Test',
    surName: 'User',
    email: 'test@user.com',
    role: 'ADMIN',
    token: 'fake-jwt-token'
  });

  registerActivity = vi.fn();
  hadRecentActivity = vi.fn().mockReturnValue(true);
  getUserFromStorage = vi.fn().mockReturnValue(null);
  saveSession = vi.fn();
  getToken = vi.fn().mockReturnValue('fake-jwt-token');
  getRefreshToken = vi.fn().mockReturnValue('fake-refresh-token');
  updateCurrentUser = vi.fn();
  logout = vi.fn();
  login = vi.fn().mockResolvedValue({ ok: true, message: 'Bienvenido.' });
  refreshSession = vi.fn();
  startSessionWatcher = vi.fn();
  stopSessionWatcher = vi.fn();
  resumeSessionWatcher = vi.fn();
}

export class MockMessageService {
  add = vi.fn();
  addAll = vi.fn();
  clear = vi.fn();
  messageSource = new Subject<any>();
  messageSource$ = this.messageSource.asObservable();
  messageObserver = this.messageSource.asObservable();
  clearSource = new Subject<any>();
  clearObserver = this.clearSource.asObservable();
}

export class MockConfirmationService {
  confirm = vi.fn().mockImplementation((options: any) => {
    if (options.accept) {
      options.accept();
    }
  });
  close = vi.fn();
  requireConfirmation$ = of();
}

export class MockLayoutService {
  sidebarOpen = signal(false);
  activeDrawer = signal<any>(null);

  toggle = vi.fn().mockImplementation(() => {
    this.sidebarOpen.update(v => !v);
  });
  open = vi.fn().mockImplementation(() => {
    this.sidebarOpen.set(true);
  });
  close = vi.fn().mockImplementation(() => {
    this.sidebarOpen.set(false);
  });
  openDrawer = vi.fn().mockImplementation((type) => {
    this.activeDrawer.set(type);
  });
  closeDrawer = vi.fn().mockImplementation(() => {
    this.activeDrawer.set(null);
  });
  toggleDrawer = vi.fn().mockImplementation((type) => {
    if (this.activeDrawer() === type) {
      this.closeDrawer();
    } else {
      this.openDrawer(type);
    }
  });
}

export class MockExportService {
  generarPDFConPestana = vi.fn();
  exportarAExcel = vi.fn();
}
