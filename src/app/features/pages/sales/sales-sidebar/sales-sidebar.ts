import { Component, input, output, computed } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sales-sidebar',
  imports: [InputTextModule, IconFieldModule, InputIconModule, NgClass],
  templateUrl: './sales-sidebar.html',
})
export class SalesSidebar {
  busqueda = input<string>('');
  metodoPagoSeleccionado = input<string>('');
  estadoSeleccionado = input<string>('');
  metodosPago = input<any[]>([]);

  busquedaChange = output<string>();
  metodoPagoChange = output<string>();
  estadoChange = output<string>();
  limpiarFiltros = output<void>();

  estados = [
    { name: 'Completada', dot: 'bg-green-500' },
    { name: 'Anulada', dot: 'bg-red-500' },
  ];

  metodosIcono: Record<string, string> = {
    'Efectivo': 'pi-wallet',
    'Tarjeta': 'pi-credit-card',
    'Yape': 'pi-mobile',
    'Plin': 'pi-mobile',
  };

  hayFiltros = computed(() => !!(this.busqueda() || this.metodoPagoSeleccionado() || this.estadoSeleccionado()));

  onBusquedaInput(event: Event): void {
    this.busquedaChange.emit((event.target as HTMLInputElement).value);
  }

  onMetodoClick(name: string): void {
    this.metodoPagoChange.emit(this.metodoPagoSeleccionado() === name ? '' : name);
  }

  onEstadoClick(name: string): void {
    this.estadoChange.emit(this.estadoSeleccionado() === name ? '' : name);
  }
}