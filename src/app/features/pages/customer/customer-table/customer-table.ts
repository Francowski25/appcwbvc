import { Component, input } from '@angular/core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-customer-table',
  standalone: true,
  imports: [TableModule],
  templateUrl: './customer-table.html',
  styleUrl: './customer-table.css',
})
export class CustomerTable {
  clientes = input.required<any[]>();
  loading = input<boolean>(false);
  error = input<string>('');
}