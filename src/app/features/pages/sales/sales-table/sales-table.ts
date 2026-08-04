import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-sales-table',
  standalone: true,
  imports: [
    CommonModule,
    TooltipModule,
    PaginatorModule,
    DecimalPipe
  ],
  templateUrl: './sales-table.html',
})
export class SalesTable {
  ventas = input.required<any[]>();
  loading = input<boolean>(false);
  error = input<string>('');

  verDetalle = output<any>();
  nuevaVenta = output<void>();
  exportarExcel = output<void>();
  exportarPDF = output<void>();

  filasPorPagina = signal<number>(10);
  paginaActual = signal<number>(0);

  protected readonly Number = Number;

  filtrados = computed(() => this.ventas() || []);

  paginados = computed(() => {
    const inicio = this.paginaActual() * this.filasPorPagina();
    const fin = inicio + this.filasPorPagina();
    return this.filtrados().slice(inicio, fin);
  });

  primerRegistro = computed(() => {
    if (this.filtrados().length === 0) return 0;
    return this.paginaActual() * this.filasPorPagina() + 1;
  });

  ultimoRegistro = computed(() => {
    const fin = (this.paginaActual() + 1) * this.filasPorPagina();
    return Math.min(fin, this.filtrados().length);
  });

  onPageChange(event: PaginatorState): void {
    this.paginaActual.set(event.page ?? 0);
    if (event.rows) {
      this.filasPorPagina.set(event.rows);
    }
  }
}