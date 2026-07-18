import { Component, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-supplier-table',
  standalone: true,
  imports: [TableModule, ButtonModule, TooltipModule],
  templateUrl: './supplier-table.html',
  styleUrl: './supplier-table.css',
})
export class SupplierTable {
  proveedores = input.required<any[]>();
  loading = input<boolean>(false);
  error = input<string>('');

  editar = output<any>();
  toggleStatus = output<any>();
  nuevo = output<void>();
}