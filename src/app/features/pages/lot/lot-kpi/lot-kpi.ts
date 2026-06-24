import { Component, input } from '@angular/core';

@Component({
  selector: 'app-lot-kpi',
  imports: [],
  templateUrl: './lot-kpi.html',
})
export class LotKpi {
  totalLotes = input.required<number>();
  porVencer = input.required<number>();
  agotados = input.required<number>();
  valorAlmacen = input.required<number>();
}