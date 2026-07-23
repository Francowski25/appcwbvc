import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-middle-panels',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-middle-panels.html'
})
export class DashboardMiddlePanels {
  topProductos = input<any[]>([]);
  alertasStock = input<any[]>([]);
  alertasVencimiento = input<any[]>([]);
  totalAlertas = input<number>(0);
  recentSales = input<any[]>([]);
  getHoraFn = input<(date: string) => string>();

  getHora(dateStr: string): string {
    const fn = this.getHoraFn();
    return fn ? fn(dateStr) : dateStr;
  }
}