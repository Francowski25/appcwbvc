import { Component, input } from '@angular/core';

@Component({
  selector: 'app-inventory-kpi',
  imports: [],
  templateUrl: './inventory-kpi.html',
})
export class InventoryKpi {
  agotados = input.required<number>();
  criticos = input.required<number>();
  enAlerta = input.required<number>();
  saludInventario = input.required<number>();
}