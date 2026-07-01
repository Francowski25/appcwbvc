import { Component, input } from '@angular/core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-customer-table',
  imports: [TableModule],
  templateUrl: './customer-table.html',
})
export class CustomerTable {
  clientes = input.required<any[]>();
  loading = input<boolean>(false);
  error = input<string>('');
}