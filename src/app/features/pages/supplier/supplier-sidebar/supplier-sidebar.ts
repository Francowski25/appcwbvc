import { Component, input, output } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-supplier-sidebar',
  standalone: true,
  imports: [InputTextModule, IconFieldModule, InputIconModule, NgClass],
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
    { name: 'activo', label: 'Activo', dot: 'bg-green-500' },
    { name: 'inactivo', label: 'Inactivo', dot: 'bg-red-500' },
  ];

  hayFiltros = () => !!(this.busqueda() || this.estadoSeleccionado());

  onBusquedaInput(event: Event): void {
    this.busquedaChange.emit((event.target as HTMLInputElement).value);
  }

  onEstadoClick(name: string): void {
    this.estadoChange.emit(this.estadoSeleccionado() === name ? '' : name);
  }
}