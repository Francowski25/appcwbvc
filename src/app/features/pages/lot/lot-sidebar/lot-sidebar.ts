import { Component, input, output, computed } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { NgClass } from '@angular/common';

interface FiltroContador {
  name: string;
  count: number;
}

@Component({
  selector: 'app-lot-sidebar',
  imports: [
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    NgClass
  ],
  templateUrl: './lot-sidebar.html',
  styleUrl: './lot-sidebar.css',
})

export class LotSidebar {
  lotes = input.required<any[]>();
  busqueda = input<string>('');
  estadoSeleccionado = input<string>('');
  proveedorSeleccionado = input<string>('');

  busquedaChange = output<string>();
  estadoChange = output<string>();
  proveedorChange = output<string>();
  limpiarFiltros = output<void>();

  estados = computed<FiltroContador[]>(() => {
    return this.lotes().reduce((acc: FiltroContador[], l: any) => {
      const estado = l.expirationStatus || 'Sin fecha';
      const existing = acc.find(e => e.name === estado);
      existing ? existing.count++ : acc.push({ name: estado, count: 1 });
      return acc;
    }, []);
  });

  proveedores = computed<FiltroContador[]>(() => {
    return this.lotes().reduce((acc: FiltroContador[], l: any) => {
      const nombre = l.supplierName || 'Sin proveedor';
      const existing = acc.find(p => p.name === nombre);
      existing ? existing.count++ : acc.push({ name: nombre, count: 1 });
      return acc;
    }, []);
  });

  hayFiltrosActivos = computed(() =>
    !!(this.busqueda() || this.proveedorSeleccionado() || this.estadoSeleccionado())
  );

  onBusquedaInput(event: Event): void {
    this.busquedaChange.emit((event.target as HTMLInputElement).value);
  }

  onEstadoClick(name: string): void {
    this.estadoChange.emit(this.estadoSeleccionado() === name ? '' : name);
  }

  onProveedorClick(name: string): void {
    this.proveedorChange.emit(this.proveedorSeleccionado() === name ? '' : name);
  }

  getBadgeDot(estado: string): string {
    switch (estado) {
      case 'Vigente': return 'bg-green-500';
      case 'Por vencer': return 'bg-orange-400';
      case 'Vencido': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  }
}