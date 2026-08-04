import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-lot-kpi',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './lot-kpi.html',
})
export class LotKpi {
  totalLotes = input.required<number>();
  optimos = input.required<number>();
  porVencer = input.required<number>();
  vencidos = input.required<number>();
  agotados = input.required<number>();
  valorAlmacen = input.required<number>();
}