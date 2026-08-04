import { Component, input, output, signal, computed } from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-customer-table',
  standalone: true,
  imports: [PaginatorModule, TooltipModule],
  templateUrl: './customer-table.html',
  styleUrl: './customer-table.css',
})
export class CustomerTable {
  clientes = input.required<any[]>();
  loading = input<boolean>(false);
  error = input<string>('');
  filasPorPagina = input<number>(10);

  exportarExcel = output<void>();
  exportarPDF = output<void>();
  crearCliente = output<void>();
  seleccionar = output<any>();
  cambiarEstado = output<any>();

  primerRegistro = signal<number>(0);

  filtrados = computed(() => this.clientes());

  paginados = computed(() => {
    const inicio = this.primerRegistro();
    const fin = inicio + this.filasPorPagina();
    return this.filtrados().slice(inicio, fin);
  });

  ultimoRegistro = computed(() => {
    const total = this.filtrados().length;
    const calculado = this.primerRegistro() + this.filasPorPagina();
    return calculado > total ? total : calculado;
  });

  onPageChange(event: any): void {
    this.primerRegistro.set(event.first);
  }
}