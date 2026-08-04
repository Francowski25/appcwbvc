import { TitleCasePipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-laboratory-table',
  standalone: true,
  imports: [
    PaginatorModule,
    TooltipModule
  ],
  templateUrl: './laboratory-table.html',
  styleUrl: './laboratory-table.css',
})
export class LaboratoryTable {
  private readonly confirmationService = inject(ConfirmationService);

  laboratorios = input<any[]>([]);
  total = input<number>(0);
  loading = input<boolean>(false);
  error = input<string>('');

  crearLaboratorio = output<void>();
  onEdit = output<any>();
  onToggleStatus = output<any>();
  onExportExcel = output<void>();
  onExportPdf = output<void>();

  filasPorPagina = signal<number>(10);
  paginaActual = signal<number>(0);

  paginados = computed(() => {
    const inicio = this.paginaActual() * this.filasPorPagina();
    const fin = inicio + this.filasPorPagina();
    return this.laboratorios().slice(inicio, fin);
  });

  totalPaginas = computed(() =>
    Math.ceil(this.laboratorios().length / this.filasPorPagina()) || 1
  );

  primerRegistro = computed(() => {
    if (this.laboratorios().length === 0) return 0;
    return this.paginaActual() * this.filasPorPagina() + 1;
  });

  ultimoRegistro = computed(() => {
    const ultimoCalculado = (this.paginaActual() + 1) * this.filasPorPagina();
    return Math.min(ultimoCalculado, this.laboratorios().length);
  });

  onPageChange(event: any): void {
    this.paginaActual.set(event.page);
    this.filasPorPagina.set(event.rows);
  }

  confirmarCambioEstado(event: Event, lab: any): void {
    const esActivo = lab.status?.toLowerCase() === 'activo';
    const accion = esActivo ? 'desactivar' : 'activar';
    const icono = esActivo ? 'pi pi-lock' : 'pi pi-unlock';

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Deseas ${accion} el laboratorio "${lab.name}"?`,
      icon: icono,
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      acceptButtonProps: {
        label: esActivo ? 'Desactivar' : 'Activar',
        severity: esActivo ? 'danger' : 'success'
      },
      accept: () => {
        this.onToggleStatus.emit(lab);
      }
    });
  }
}