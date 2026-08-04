import { Component, input, output, computed } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-movements-sidebar',
  imports: [NgClass],
  templateUrl: './movements-sidebar.html',
  styleUrl: './movements-sidebar.css',
})
export class MovementsSidebar {
  busquedaValue = input<string>('');
  tipoValue = input<string>('');
  usuarioValue = input<string>('');

  movimientos = input<any[]>([]);

  busquedaChange = output<string>();
  tipoChange = output<string>();
  usuarioChange = output<string>();
  limpiarFiltros = output<void>();

  hayFiltros = computed(() =>
    !!(this.busquedaValue() || this.tipoValue() || this.usuarioValue())
  );

  totalMovimientos = computed(() => this.movimientos().length);

  tipos = [
    {
      name: 'Entrada',
      label: 'Entradas',
      icon: 'pi pi-arrow-down-left',
      count: computed(() => this.movimientos().filter((m: any) => m.type === 'Entrada').length)
    },
    {
      name: 'Salida',
      label: 'Salidas',
      icon: 'pi pi-arrow-up-right',
      count: computed(() => this.movimientos().filter((m: any) => m.type === 'Salida').length)
    },
    {
      name: 'Ajuste_Positivo',
      label: 'Ajustes (+)',
      icon: 'pi pi-plus-circle',
      count: computed(() => this.movimientos().filter((m: any) => m.type === 'Ajuste_Positivo').length)
    },
    {
      name: 'Ajuste_Negativo',
      label: 'Ajustes (-)',
      icon: 'pi pi-minus-circle',
      count: computed(() => this.movimientos().filter((m: any) => m.type === 'Ajuste_Negativo').length)
    }
  ];

  onBusquedaInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.busquedaChange.emit(val);
  }

  onLimpiarBusqueda(): void {
    this.busquedaChange.emit('');
  }

  onLimpiarTodosLosFiltros(): void {
    this.limpiarFiltros.emit();
  }
}