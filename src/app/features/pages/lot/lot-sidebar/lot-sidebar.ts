import { Component, input, output, signal, computed, effect } from '@angular/core';
import { NgClass } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

export interface Proveedor {
  name: string;
  count: number;
}

export interface EstadoLote {
  name: string;
  count: number;
}

@Component({
  selector: 'app-lot-sidebar',
  standalone: true,
  imports: [
    NgClass,
    IconFieldModule,
    InputIconModule,
    InputTextModule
  ],
  templateUrl: './lot-sidebar.html',
  styleUrl: './lot-sidebar.css',
})
export class LotSidebar {
  proveedores = input<Proveedor[]>([]);
  estados = input<EstadoLote[]>([]);
  proveedorSeleccionado = input<string>('');
  estadoSeleccionado = input<string>('');

  proveedorChange = output<string>();
  estadoChange = output<string>();
  searchChange = output<string>();

  busquedaGeneral = signal<string>('');
  busquedaProveedor = signal<string>('');
  busquedaEstado = signal<string>('');

  constructor() {
    effect(() => {
      this.busquedaProveedor.set(this.proveedorSeleccionado());
    }, { allowSignalWrites: true });

    effect(() => {
      this.busquedaEstado.set(this.estadoSeleccionado());
    }, { allowSignalWrites: true });
  }

  proveedoresFiltrados = computed(() => {
    const q = this.busquedaProveedor().toLowerCase().trim();
    if (!q) return [];
    return this.proveedores().filter(p => p.name.toLowerCase().includes(q));
  });

  estadosFiltrados = computed(() => {
    const q = this.busquedaEstado().toLowerCase().trim();
    if (!q) return [];
    return this.estados().filter(e => e.name.toLowerCase().includes(q));
  });

  esSeleccionExactaProveedor(): boolean {
    const q = this.busquedaProveedor().toLowerCase().trim();
    return this.proveedores().some(p => p.name.toLowerCase() === q);
  }

  esSeleccionExactaEstado(): boolean {
    const q = this.busquedaEstado().toLowerCase().trim();
    return this.estados().some(e => e.name.toLowerCase() === q);
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.busquedaGeneral.set(value);
    this.searchChange.emit(value);
  }

  onBuscarProveedor(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.busquedaProveedor.set(value);
    this.proveedorChange.emit(value);
  }

  onBuscarEstado(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.busquedaEstado.set(value);
    this.estadoChange.emit(value);
  }

  seleccionarProveedor(name: string): void {
    this.busquedaProveedor.set(name);
    this.proveedorChange.emit(name);
  }

  seleccionarEstado(name: string): void {
    this.busquedaEstado.set(name);
    this.estadoChange.emit(name);
  }

  limpiarBusquedaGeneral(): void {
    this.busquedaGeneral.set('');
    this.searchChange.emit('');
  }

  limpiarProveedor(): void {
    this.busquedaProveedor.set('');
    this.proveedorChange.emit('');
  }

  limpiarEstado(): void {
    this.busquedaEstado.set('');
    this.estadoChange.emit('');
  }

  limpiarTodosLosFiltros(): void {
    this.limpiarBusquedaGeneral();
    this.limpiarProveedor();
    this.limpiarEstado();
  }

  getBadgeIcon(estado: string): string {
    const est = estado.toLowerCase().trim();
    if (est.includes('vigente') || est.includes('óptimo') || est.includes('optimo')) {
      return 'pi pi-check-circle';
    }
    if (est.includes('vencer')) {
      return 'pi pi-exclamation-triangle';
    }
    if (est.includes('vencido')) {
      return 'pi pi-times-circle';
    }
    if (est.includes('agotado')) {
      return 'pi pi-ban';
    }
    return 'pi pi-info-circle';
  }

  getBadgeStyle(estado: string): string {
    const est = estado.toLowerCase().trim();
    if (est.includes('vigente') || est.includes('óptimo') || est.includes('optimo')) {
      return 'bg-emerald-50 text-emerald-600';
    }
    if (est.includes('vencer')) {
      return 'bg-amber-50 text-amber-600';
    }
    if (est.includes('vencido')) {
      return 'bg-rose-50 text-rose-600';
    }
    if (est.includes('agotado')) {
      return 'bg-slate-100 text-slate-500';
    }
    return 'bg-gray-100 text-gray-500';
  }

}