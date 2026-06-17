import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableModule } from 'primeng/table';
import { DecimalPipe } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-products-table',
  standalone: true,
  imports: [
    TableModule,
    DecimalPipe,
    TooltipModule,
    TagModule,
  ],
  templateUrl: './products-table.html',
  styleUrl: './products-table.css',
})
export class ProductsTable {
  @Input() filtrados: any[] = [];
  @Input() loading: boolean = false;
  @Input() error: string = '';
  @Input() categoriaSeleccionada: string = '';
  @Input() laboratorioSeleccionado: string = '';

  // 1. Agregamos el Output para el ojo de detalles de producto
  @Output() seleccionar = new EventEmitter<any>();
  @Output() crearProducto = new EventEmitter<void>();
  @Output() exportarCSV = new EventEmitter<void>();

  getSeverity(status: string): 'success' | 'danger' {
    return status?.toLowerCase() === 'activo' ? 'success' : 'danger';
  }

  onEditar(product: any): void {
    console.log('Editar:', product);
  }

  exportCSV() { }

  exportPDF() { }

}