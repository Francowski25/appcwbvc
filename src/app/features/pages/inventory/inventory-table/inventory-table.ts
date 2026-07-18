import { Component, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-inventory-table',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    TagModule
  ],
  templateUrl: './inventory-table.html',
  styleUrl: './inventory-table.css',
})
export class InventoryTable {
  productos = input.required<any[]>();
  loading = input<boolean>(false);

  busqueda = output<string>();
  verLotes = output<any>();
  registrarIngreso = output<any>();

  protected readonly Number = Number;

  getDeficit(product: any): number {
    return Number(product.stockMinimum) - Number(product.totalStock);
  }

  onBusqueda(event: Event): void {
    this.busqueda.emit((event.target as HTMLInputElement).value);
  }
}