import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-sidebar.html',
  styleUrl: './category-sidebar.css'
})
export class CategorySidebar {
  busquedaValue = input<string>('');
  estadoValue = input<string>('');
  totalCategorias = input<number>(0);
  totalActivas = input<number>(0);
  totalInactivas = input<number>(0);

  busquedaChange = output<string>();
  estadoChange = output<string>();
  crearCategoria = output<void>();

  estados = [
    { name: 'activo', label: 'Activos', icon: 'pi pi-check-circle', count: () => this.totalActivas() },
    { name: 'inactivo', label: 'Inactivos', icon: 'pi pi-ban', count: () => this.totalInactivas() },
  ];

  hayFiltros = () => !!(this.busquedaValue() || this.estadoValue());

  onBusquedaInput(event: Event): void {
    this.busquedaChange.emit((event.target as HTMLInputElement).value);
  }

  onLimpiarBusqueda(): void {
    this.busquedaChange.emit('');
  }

  onLimpiarTodosLosFiltros(): void {
    this.busquedaChange.emit('');
    this.estadoChange.emit('');
  }
}