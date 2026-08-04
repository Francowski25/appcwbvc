import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-supplier-sidebar',
  standalone: true,
  imports: [NgClass],
  templateUrl: './supplier-sidebar.html',
  styleUrl: './supplier-sidebar.css',
})
export class SupplierSidebar {
  busqueda = input<string>('');
  estadoSeleccionado = input<string>('');

  busquedaChange = output<string>();
  estadoChange = output<string>();
  limpiarFiltros = output<void>();

  estados = [
    { name: 'activo', label: 'Activos', icon: 'pi pi-check-circle' },
    { name: 'inactivo', label: 'Inactivos', icon: 'pi pi-ban' },
  ];

  hayFiltros = () => !!(this.busqueda() || this.estadoSeleccionado());

  onBusquedaInput(event: Event): void {
    this.busquedaChange.emit((event.target as HTMLInputElement).value);
  }

  onLimpiarBusqueda(): void {
    this.busquedaChange.emit('');
  }

  onEstadoClick(name: string): void {
    this.estadoChange.emit(this.estadoSeleccionado() === name ? '' : name);
  }
}