import { Component, input, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-lot-table',
  standalone: true,
  imports: [
    CommonModule,
    PaginatorModule,
    DecimalPipe
  ],
  templateUrl: './lot-table.html',
})
export class LotTable {
  lotes = input.required<any[]>();
  loading = input<boolean>(false);
  error = input<string>('');

  paginaActual = signal<number>(0);
  filasPorPagina = signal<number>(10);

  protected readonly Number = Number;

  paginados = computed(() => {
    const inicio = this.paginaActual() * this.filasPorPagina();
    return this.lotes().slice(inicio, inicio + this.filasPorPagina());
  });

  primerRegistro = computed(() => {
    if (this.lotes().length === 0) return 0;
    return this.paginaActual() * this.filasPorPagina() + 1;
  });

  ultimoRegistro = computed(() => {
    const ultimo = (this.paginaActual() + 1) * this.filasPorPagina();
    return Math.min(ultimo, this.lotes().length);
  });

  onPageChange(event: any): void {
    this.paginaActual.set(event.page);
    this.filasPorPagina.set(event.rows);
  }

  getBadgeEstado(status: string): { badge: string; icon: string } {
    const s = (status || '').toLowerCase().trim();

    if (s.includes('vigente') || s.includes('óptimo') || s.includes('optimo')) {
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: 'pi pi-check-circle text-emerald-500'
      };
    }

    if (s.includes('por vencer') || s.includes('próximo') || s.includes('proximo')) {
      return {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: 'pi pi-exclamation-triangle text-amber-500'
      };
    }

    if (s.includes('vencido') || s.includes('expirado')) {
      return {
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: 'pi pi-times-circle text-rose-500'
      };
    }

    return {
      badge: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: 'pi pi-info-circle text-slate-400'
    };
  }
}