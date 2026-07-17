import { Component, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { DecimalPipe } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-products-table',
  standalone: true,
  imports: [
    TableModule,
    DecimalPipe,
    TooltipModule,
    TagModule,
  ],
  templateUrl: './products-table.html',
  styleUrl: './products-table.css',
})
export class ProductsTable {
  filtrados = input<any[]>([]);
  loading = input<boolean>(false);
  error = input<string>('');

  seleccionar = output<any>();
}