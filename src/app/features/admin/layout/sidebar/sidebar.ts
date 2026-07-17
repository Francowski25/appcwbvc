import { Component, signal, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  collapsed = signal(false);
  openSection = signal<string | null>(null);
  userMenuOpen = signal(false);

  user = (() => {
    const raw = localStorage.getItem('current_user');
    return raw ? JSON.parse(raw) : null;
  })();

  private router = inject(Router);
  layout = inject(LayoutService);

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.layout.close());
  }

  toggle() {
    this.collapsed.set(!this.collapsed());
  }

  toggleSection(section: string) {
    this.openSection.set(this.openSection() === section ? null : section);
  }

  isSectionOpen(section: string): boolean {
    return this.openSection() === section;
  }

  toggleUserMenu() {
    this.userMenuOpen.set(!this.userMenuOpen());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.userMenuOpen.set(false);
    }
  }

  logout() {
    localStorage.removeItem('current_user');
    this.router.navigate(['/']);
  }
}