import { TestBed } from '@angular/core/testing';
import { LayoutService } from './layout.service';
import { PLATFORM_ID } from '@angular/core';

describe('LayoutService', () => {
  let service: LayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LayoutService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(LayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open and close sidebar', () => {
    expect(service.sidebarOpen()).toBe(false);
    service.open();
    expect(service.sidebarOpen()).toBe(true);
    service.close();
    expect(service.sidebarOpen()).toBe(false);
  });

  it('should toggle sidebar', () => {
    expect(service.sidebarOpen()).toBe(false);
    service.toggle();
    expect(service.sidebarOpen()).toBe(true);
    service.toggle();
    expect(service.sidebarOpen()).toBe(false);
  });

  it('should manage active drawer', () => {
    expect(service.activeDrawer()).toBeNull();
    service.openDrawer('settings');
    expect(service.activeDrawer()).toBe('settings');
    service.closeDrawer();
    expect(service.activeDrawer()).toBeNull();
  });

  it('should toggle drawer correctly', () => {
    service.toggleDrawer('messages');
    expect(service.activeDrawer()).toBe('messages');
    service.toggleDrawer('messages');
    expect(service.activeDrawer()).toBeNull();

    service.toggleDrawer('notifications');
    expect(service.activeDrawer()).toBe('notifications');
    service.toggleDrawer('settings');
    expect(service.activeDrawer()).toBe('settings');
  });

  it('should close sidebar on window resize if width >= 1024 and sidebar is open', () => {
    service.open();
    // Simulate window innerWidth
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1025 });
    window.dispatchEvent(new Event('resize'));
    expect(service.sidebarOpen()).toBe(false);
  });
});
