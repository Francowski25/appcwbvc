import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  /** Whether the off-canvas sidebar is open on mobile/tablet (< lg breakpoint). */
  sidebarOpen = signal(false);

  toggle() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  open() {
    this.sidebarOpen.set(true);
  }

  close() {
    this.sidebarOpen.set(false);
  }
}
