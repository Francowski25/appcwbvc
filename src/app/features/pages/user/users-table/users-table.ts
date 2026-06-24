import { Component, inject, Input, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api'; // Necesario para el modal

@Component({
  selector: 'app-users-table',
  standalone: true,
  imports: [
    TableModule,
    TooltipModule,
  ],
  templateUrl: './users-table.html',
  styleUrl: './users-table.css',
})
export class UsersTable {
  private readonly confirmationService = inject(ConfirmationService);

  @Input() filtrados: any[] = [];
  usuariosData = input<any[]>([]);
  loadingState = input<boolean>(false);

  editarUser = output<any>();
  cambiarPassword = output<any>();
  cambiarEstado = output<any>();
  crearUsuario = output<void>();
  exportarCSV = output<void>();

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'vendedor': 'Vendedor',
      'quimico': 'Químico',
      'administrador': 'Administrador'
    };
    return labels[role?.toLowerCase()] ?? role;
  }

  confirmarCambioEstado(event: Event, user: any): void {
    const esActivo = user.status?.toLowerCase() === 'activo';
    const accion = esActivo ? 'bloquear' : 'activar';
    const icono = esActivo ? 'pi pi-lock' : 'pi pi-unlock';

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Deseas ${accion} a ${user.firstName} ${user.surName}?`,
      icon: icono,
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      acceptButtonProps: {
        label: esActivo ? 'Bloquear' : 'Activar',
        severity: esActivo ? 'danger' : 'success'
      },
      accept: () => {
        this.cambiarEstado.emit(user);
      },
      reject: () => { }
    });
  }
}