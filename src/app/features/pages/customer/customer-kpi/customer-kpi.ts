import { Component, input } from '@angular/core';

@Component({
  selector: 'app-customer-kpi',
  standalone: true,
  imports: [],
  templateUrl: './customer-kpi.html',
  styleUrl: './customer-kpi.css',
})
export class CustomerKpi {
  totalClientes = input.required<number>();
  clientesHoy = input.required<number>();
  conDni = input.required<number>();
  conRuc = input.required<number>();
}