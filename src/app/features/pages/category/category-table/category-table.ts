import { Component, inject, input, output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-category-table',
  standalone: true,
  imports: [
    TitleCasePipe,
    TableModule,
    TooltipModule,
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