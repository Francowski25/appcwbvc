import { Component, computed, input, output, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';

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
    TagModule,
    PaginatorModule // 👈 Agregado para el paginador
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

  // Estado de paginación local
  paginaActual = signal<number>(0);
  filasPorPagina = signal<number>(15); // 👈 Configurado a 15 por defecto

  // Productos cortados para la página activa
  productosPaginados = computed(() => {
    const inicio = this.paginaActual() * this.filasPorPagina();
    return this.productos().slice(inicio, inicio + this.filasPorPagina());
  });

  getDeficit(product: any): number {
    const min = Number(product.stockMinimum) || 0;
    const actual = Number(product.totalStock) || 0;
    const diff = min - actual;
    return diff > 0 ? diff : 0;
  }

  onBusqueda(event: Event): void {
    this.paginaActual.set(0); // Reiniciar a la primera página cuando busquen
    this.busqueda.emit((event.target as HTMLInputElement).value);
  }

  onPageChange(event: any): void {
    this.paginaActual.set(event.page);
    this.filasPorPagina.set(event.rows);
  }
}