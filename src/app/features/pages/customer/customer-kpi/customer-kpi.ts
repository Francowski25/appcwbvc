import { Component, input } from '@angular/core';

@Component({
  selector: 'app-customer-kpi',
  standalone: true,
  imports: [],
  templateUrl: './customer-kpi.html',
  styleUrl: './customer-kpi.css',
})
export class CustomerKpi {
  totalClientes = input<number>(0);
  clientesHoy = input<number>(0);
  conDni = input<number>(0);
  conRuc = input<number>(0);
  activos = input<number>(0);
  otrosDocs = input<number>(0);
}