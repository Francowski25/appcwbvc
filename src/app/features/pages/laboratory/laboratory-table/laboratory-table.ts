import { TitleCasePipe } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api'; // 1. Importar ConfirmationService

@Component({
  selector: 'app-laboratory-table',
  standalone: true,
  imports: [
    TitleCasePipe,
    TableModule,
    TooltipModule
  ],
  templateUrl: './laboratory-table.html',
  styleUrl: './laboratory-table.css',
})
export class LaboratoryTable {
  private readonly confirmationService = inject(ConfirmationService); // 2. Inyectar el servicio

  laboratorios = input<any[]>([]);
  total = input<number>(0);
  loading = input<boolean>(false);
  error = input<string>('');

  crearLaboratorio = output<void>();
  onEdit = output<any>();
  onToggleStatus = output<any>();
  onExportExcel = output<void>();
  onExportPdf = output<void>();

  // 3. Método para desplegar el diálogo de confirmación
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