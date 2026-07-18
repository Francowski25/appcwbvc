import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-lot-kpi',
  imports: [DecimalPipe],
  templateUrl: './lot-kpi.html',
})
export class LotKpi {
  totalLotes = input.required<number>();
  porVencer = input.required<number>();
  agotados = input.required<number>();
  valorAlmacen = input.required<number>();
}