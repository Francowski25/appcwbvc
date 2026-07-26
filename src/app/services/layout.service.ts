import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type DrawerType = 'messages' | 'notifications' | 'settings' | null;

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private platformId = inject(PLATFORM_ID);

  sidebarOpen = signal(false);

  activeDrawer = signal<DrawerType>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024 && this.sidebarOpen()) {
          this.close();
        }
      });
    }
  }

  toggle() {
    this.sidebarOpen.update((open) => !open);
  }

  open() {
    this.sidebarOpen.set(true);
  }

  close() {
    this.sidebarOpen.set(false);
  }

  openDrawer(type: DrawerType) {
    this.activeDrawer.set(type);
  }

  closeDrawer() {
    this.activeDrawer.set(null);
  }

  toggleDrawer(type: DrawerType) {
    if (this.activeDrawer() === type) {
      this.closeDrawer();
    } else {
      this.openDrawer(type);
    }
  }
}