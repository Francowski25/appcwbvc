import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-sales-kpi',
  imports: [DecimalPipe],
  templateUrl: './sales-kpi.html',
})
export class SalesKpi {
  totalVentas = input.required<number>();
  montoTotal = input.required<number>();
  ventasHoy = input.required<number>();
  ticketPromedio = input.required<number>();
}