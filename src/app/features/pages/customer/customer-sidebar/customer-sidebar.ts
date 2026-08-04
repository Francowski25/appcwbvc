import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-sidebar.html',
  styleUrl: './customer-sidebar.css'
})
export class CustomerSidebar {
  // Inputs desde el padre
  busqueda = input<string>('');
  tipoDocSeleccionado = input<string>('');
  tiposDoc = input<{ name: string; count: number }[]>([]);
  totalClientes = input<number>(0);

  // Outputs hacia el padre
  busquedaChange = output<string>();
  tipoDocChange = output<string>();
  limpiarFiltros = output<void>();

  // Evalúa si hay algún filtro activo para mostrar el botón "Limpiar"
  hayFiltros = computed(() => !!this.busqueda() || !!this.tipoDocSeleccionado());

  onBusquedaInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.busquedaChange.emit(value);
  }

  onLimpiarBusqueda(): void {
    this.busquedaChange.emit('');
  }

  onTipoDocClick(tipo: string): void {
    // Si vuelve a hacer clic en el mismo tipo seleccionado, se desmarca regresando a ''
    const nuevoTipo = this.tipoDocSeleccionado() === tipo ? '' : tipo;
    this.tipoDocChange.emit(nuevoTipo);
  }

  onLimpiarTodosLosFiltros(): void {
    this.limpiarFiltros.emit();
  }

  getIcono(tipo: string): string {
    switch (tipo.toUpperCase()) {
      case 'DNI':
        return 'pi pi-id-card';
      case 'RUC':
        return 'pi pi-building';
      case 'PASAPORTE':
      case 'CE':
        return 'pi pi-globe';
      default:
        return 'pi pi-user';
    }
  }
}