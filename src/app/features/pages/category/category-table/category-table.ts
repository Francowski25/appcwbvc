import { Component, inject, input, output, signal, computed } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-category-table',
  standalone: true,
  imports: [
    TooltipModule,
    PaginatorModule
  ],
  templateUrl: './category-table.html',
  styleUrl: './category-table.css',
})
export class CategoryTable {
  private readonly confirmationService = inject(ConfirmationService);

  categorias = input<any[]>([]);
  total = input<number>(0);
  loading = input<boolean>(false);
  error = input<string>('');

  crearCategoria = output<void>();
  onEdit = output<any>();
  onToggleStatus = output<any>();
  onExportExcel = output<void>();
  onExportPdf = output<void>();

  paginaActual = signal<number>(0);
  filasPorPagina = signal<number>(9);

  paginadas = computed(() => {
    const inicio = this.paginaActual() * this.filasPorPagina();
    const fin = inicio + this.filasPorPagina();
    return this.categorias().slice(inicio, fin);
  });

  totalPaginas = computed(() =>
    Math.ceil(this.categorias().length / this.filasPorPagina()) || 1
  );

  primerRegistro = computed(() => {
    if (this.categorias().length === 0) return 0;
    return this.paginaActual() * this.filasPorPagina() + 1;
  });

  ultimoRegistro = computed(() => {
    const ultimoCalculado = (this.paginaActual() + 1) * this.filasPorPagina();
    return Math.min(ultimoCalculado, this.categorias().length);
  });

  onPageChange(event: any): void {
    this.paginaActual.set(event.page);
    this.filasPorPagina.set(event.rows);
  }

  confirmarCambioEstado(event: Event, cat: any): void {
    const esActivo = cat.status?.toLowerCase() === 'activo';
    const accion = esActivo ? 'desactivar' : 'activar';
    const icono = esActivo ? 'pi pi-lock' : 'pi pi-unlock';

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Deseas ${accion} la categoría "${cat.name}"?`,
      icon: icono,
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      acceptButtonProps: {
        label: esActivo ? 'Desactivar' : 'Activar',
        severity: esActivo ? 'danger' : 'success'
      },
      accept: () => {
        this.onToggleStatus.emit(cat);
      }
    });
  }
}