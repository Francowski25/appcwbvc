import { Component, input, output } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [TagModule, TitleCasePipe],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {
  productoSeleccionado = input<any>(null);
  loading = input<boolean>(false);
  error = input<string>('');

  cerrarDialog = output<void>();
  editarProducto = output<any>();

  getStockLabel(stock: number, minimum: number): string {
    if (!stock || stock === 0) return 'Sin Stock';
    return stock <= (minimum || 0) ? 'Stock Crítico' : 'Disponible';
  }

  getStockSeverity(stock: number, minimum: number): 'success' | 'warn' | 'danger' {
    if (!stock || stock === 0) return 'danger';

    return stock <= (minimum || 0) ? 'warn' : 'success';
  }

  closeDialog(): void {
    this.cerrarDialog.emit();
  }

  onEditar(producto: any): void {
    this.editarProducto.emit(producto);
  }
}