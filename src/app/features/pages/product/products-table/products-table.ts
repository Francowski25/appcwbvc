import { Component, input, output, signal, computed } from '@angular/core';
import { NgClass, DecimalPipe } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-products-table',
  standalone: true,
  imports: [
    NgClass,
    DecimalPipe,
    TooltipModule,
    PaginatorModule
  ],
  templateUrl: './products-table.html',
  styleUrl: './products-table.css',
})
export class ProductsTable {
  filtrados = input<any[]>([]);
  loading = input<boolean>(false);
  error = input<string>('');
  total = input<number>(0);

  crearProducto = output<void>();
  exportarCSV = output<void>();
  exportarPDF = output<void>();
  seleccionar = output<any>();

  paginaActual = signal<number>(0);
  filasPorPagina = signal<number>(20);

  paginasTotales = computed(() => Math.ceil(this.filtrados().length / this.filasPorPagina()) || 1);

  primerRegistro = computed(() => {
    if (this.filtrados().length === 0) return 0;
    return this.paginaActual() * this.filasPorPagina() + 1;
  });

  ultimoRegistro = computed(() => {
    const ultimoCalculado = (this.paginaActual() + 1) * this.filasPorPagina();
    return Math.min(ultimoCalculado, this.filtrados().length);
  });

  paginados = computed(() => {
    const inicio = this.paginaActual() * this.filasPorPagina();
    const fin = inicio + this.filasPorPagina();
    return this.filtrados().slice(inicio, fin);
  });

  onPageChange(event: any): void {
    this.paginaActual.set(event.page);
    this.filasPorPagina.set(event.rows);
  }
}