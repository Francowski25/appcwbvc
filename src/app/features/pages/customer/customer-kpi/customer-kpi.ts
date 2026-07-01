import { Component, input } from '@angular/core';

@Component({
  selector: 'app-customer-kpi',
  imports: [],
  templateUrl: './customer-kpi.html',
})
export class CustomerKpi {
  totalClientes = input.required<number>();
  clientesHoy = input.required<number>();
  conDni = input.required<number>();
  conRuc = input.required<number>();
}