import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-bottom-panels',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-bottom-panels.html'
})
export class DashboardBottomPanels {
  recentPurchases = input<any[]>([]);
  usuarios = input<any[]>([]);
  getFechaFn = input<(date: string) => string>();

  getFecha(dateStr: string): string {
    const fn = this.getFechaFn();
    return fn ? fn(dateStr) : dateStr;
  }
}