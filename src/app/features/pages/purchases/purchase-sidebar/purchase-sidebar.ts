import { Component, input, output, computed } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-purchase-sidebar',
  imports: [
    InputTextModule,
    CommonModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './purchase-sidebar.html',
})
export class PurchaseSidebar {
  busqueda = input<string>('');
  proveedorSeleccionado = input<string>('');
  proveedores = input<any[]>([]);

  busquedaChange = output<string>();
  proveedorChange = output<string>();
  limpiarFiltros = output<void>();

  hayFiltros = computed(() => !!(this.busqueda() || this.proveedorSeleccionado()));

  onBusquedaInput(event: Event): void {
    this.busquedaChange.emit((event.target as HTMLInputElement).value);
  }

  onProveedorClick(name: string): void {
    this.proveedorChange.emit(this.proveedorSeleccionado() === name ? '' : name);
  }
}