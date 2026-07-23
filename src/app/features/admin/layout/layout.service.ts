import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private platformId = inject(PLATFORM_ID);

  sidebarOpen = signal(false);

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
}