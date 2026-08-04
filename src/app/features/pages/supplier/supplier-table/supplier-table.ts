import { Component, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-supplier-table',
  standalone: true,
  imports: [
    CommonModule,
    TooltipModule,
    PaginatorModule
  ],
  templateUrl: './supplier-table.html',
  styleUrl: './supplier-table.css',
})
export class SupplierTable {
  private readonly confirmationService = inject(ConfirmationService);

  proveedores = input.required<any[]>();
  loading = input<boolean>(false);
  error = input<string>('');

  editar = output<any>();
  toggleStatus = output<any>();
  nuevo = output<void>();
  exportarExcel = output<void>();
  exportarPDF = output<void>();

  paginaActual = signal<number>(0);
  filasPorPagina = signal<number>(10);

  paginados = computed(() => {
    const inicio = this.paginaActual() * this.filasPorPagina();
    const fin = inicio + this.filasPorPagina();
    return this.proveedores().slice(inicio, fin);
  });

  textoConteo = computed(() => {
    const total = this.proveedores().length;
    return `${total} ${total === 1 ? 'proveedor encontrado' : 'proveedores encontrados'}`;
  });

  private readonly gradients = [
    'from-pink-500 to-rose-500 shadow-pink-500/20',
    'from-indigo-500 to-purple-500 shadow-indigo-500/20',
    'from-emerald-500 to-teal-500 shadow-emerald-500/20',
    'from-amber-500 to-orange-500 shadow-amber-500/20',
    'from-sky-500 to-blue-500 shadow-sky-500/20',
    'from-violet-500 to-fuchsia-500 shadow-violet-500/20'
  ];

  getGradientClass(name: string): string {
    if (!name) return this.gradients[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.gradients.length;
    return this.gradients[index];
  }

  onPageChange(event: any): void {
    this.paginaActual.set(event.page);
    this.filasPorPagina.set(event.rows);
  }

  confirmarCambioEstado(event: Event, proveedor: any): void {
    const esActivo = proveedor.status?.toLowerCase() === 'activo';
    const accion = esActivo ? 'desactivar' : 'activar';
    const icono = esActivo ? 'pi pi-lock' : 'pi pi-unlock';

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Deseas ${accion} el proveedor "${proveedor.name}"?`,
      icon: icono,
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      acceptButtonProps: {
        label: esActivo ? 'Desactivar' : 'Activar',
        severity: esActivo ? 'danger' : 'success'
      },
      accept: () => {
        this.toggleStatus.emit(proveedor);
      }
    });
  }
}