import { Component, input, output } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-customer-sidebar',
  imports: [InputTextModule, IconFieldModule, InputIconModule, NgClass],
  templateUrl: './customer-sidebar.html',
})
export class CustomerSidebar {
  busqueda = input<string>('');
  tipoDocSeleccionado = input<string>('');
  tiposDoc = input<any[]>([]);

  busquedaChange = output<string>();
  tipoDocChange = output<string>();
  limpiarFiltros = output<void>();

  hayFiltros = () => !!(this.busqueda() || this.tipoDocSeleccionado());

  onBusquedaInput(event: Event): void {
    this.busquedaChange.emit((event.target as HTMLInputElement).value);
  }

  onTipoDocClick(name: string): void {
    this.tipoDocChange.emit(this.tipoDocSeleccionado() === name ? '' : name);
  }

  getIcono(tipo: string): string {
    const iconos: Record<string, string> = {
      'DNI': 'pi-id-card',
      'RUC': 'pi-building',
      'CE': 'pi-globe',
    };
    return iconos[tipo] ?? 'pi-file';
  }
}