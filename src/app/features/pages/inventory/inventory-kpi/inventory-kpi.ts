import { Component, input } from '@angular/core';

@Component({
  selector: 'app-inventory-kpi',
  standalone: true,
  imports: [],
  templateUrl: './inventory-kpi.html',
  styleUrl: './inventory-kpi.css',
})
export class InventoryKpi {
  agotados = input.required<number>();
  criticos = input.required<number>();
  enAlerta = input.required<number>();
  saludInventario = input.required<number>();
}