import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-purchase-kpi',
  imports: [DecimalPipe],
  templateUrl: './purchase-kpi.html',
})
export class PurchaseKpi {
  totalCompras = input.required<number>();
  montoTotal = input.required<number>();
  proveedoresDistintos = input.required<number>();
  promedioPorCompra = input.required<number>();
}