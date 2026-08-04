import { Component, input, output, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-movements-table',
  standalone: true,
  imports: [
    DatePipe,
    PaginatorModule
  ],
  templateUrl: './movements-table.html',
  styleUrl: './movements-table.css',
})
export class MovementsTable {
  filtrados = input<any[]>([]);
  loading = input<boolean>(false);
  error = input<string>('');
  total = input<number>(0);

  seleccionar = output<any>();

  paginaActual = signal<number>(0);
  filasPorPagina = signal<number>(8);

  crearMovimiento = output<void>();
  onExportExcel = output<void>();
  onExportPdf = output<void>();

  paginados = computed(() => {
    const inicio = this.paginaActual() * this.filasPorPagina();
    const fin = inicio + this.filasPorPagina();
    return this.filtrados().slice(inicio, fin);
  });

  totalPaginas = computed(() =>
    Math.ceil(this.filtrados().length / this.filasPorPagina()) || 1
  );

  primerRegistro = computed(() => {
    if (this.filtrados().length === 0) return 0;
    return this.paginaActual() * this.filasPorPagina() + 1;
  });

  ultimoRegistro = computed(() => {
    const ultimoCalculado = (this.paginaActual() + 1) * this.filasPorPagina();
    return Math.min(ultimoCalculado, this.filtrados().length);
  });

  onPageChange(event: any): void {
    this.paginaActual.set(event.page);
    this.filasPorPagina.set(event.rows);
  }

  paginaSiguiente(): void {
    if (this.paginaActual() + 1 < this.totalPaginas()) {
      this.paginaActual.update((p) => p + 1);
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual() > 0) {
      this.paginaActual.update((p) => p - 1);
    }
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  }

  shortenId(id: string): string {
    return id ? id.split('-')[0].toUpperCase() : '';
  }
}