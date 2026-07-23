import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-kpi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-kpi.html'
})
export class DashboardKpi {
  kpi = input<any>();
  pctVentas = input<number | null>(null);
  valorAlmacen = input<number>(0);
  productosOk = input<number>(0);
  stockCriticoLocal = input<number>(0);
  agotadosLocal = input<number>(0);
}