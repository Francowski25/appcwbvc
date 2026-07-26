import { Component, input, output, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    TagModule,
    InputTextModule,
    FormsModule,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail {
  producto = input<any>(null);

  onClose = output<void>();
  onSave = output<any>();
  isEditing = signal<boolean>(false);
  previewUrl = signal<string | null>(null);

  editName = signal<string>('');
  editBarcode = signal<string>('');
  editPriceSale = signal<number | null>(null);
  editStockMinimum = signal<number>(5);
  editDescription = signal<string>('');

  activarEdicion(): void {
    const p = this.producto();
    if (!p) return;

    this.editName.set(p.name ?? '');
    this.editBarcode.set(p.barcode ?? '');
    this.editPriceSale.set(p.priceSale ? Number(p.priceSale) : null);
    this.editStockMinimum.set(p.stockMinimum ? Number(p.stockMinimum) : 5);
    this.editDescription.set(p.description ?? '');

    this.previewUrl.set(null);
    this.isEditing.set(true);
  }

  cancelarEdicion(): void {
    this.isEditing.set(false);
    this.previewUrl.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  guardarCambios(): void {
    const datosActualizados = {
      ...this.producto(),
      name: this.editName().trim(),
      barcode: this.editBarcode().trim(),
      priceSale: this.editPriceSale() !== null ? String(this.editPriceSale()) : this.producto()?.priceSale,
      stockMinimum: String(this.editStockMinimum()),
      description: this.editDescription().trim(),
      image: this.previewUrl() ?? this.producto()?.image
    };

    this.onSave.emit(datosActualizados);
    this.isEditing.set(false);
  }

  closeDialog(): void {
    this.cancelarEdicion();
    this.onClose.emit();
  }

  isTrue(val: any): boolean {
    return val === true || val === 'true';
  }

  getStockLabel(stock?: string | number, minStock?: string | number): string {
    const actual = Number(stock ?? 0);
    const min = Number(minStock ?? 5);
    if (actual === 0) return 'Agotado';
    if (actual <= min) return 'Bajo Stock';
    return 'En Stock';
  }

  getStockSeverity(stock?: string | number, minStock?: number | string): 'danger' | 'warn' | 'success' {
    const actual = Number(stock ?? 0);
    const min = Number(minStock ?? 5);
    if (actual === 0) return 'danger';
    if (actual <= min) return 'warn';
    return 'success';
  }
}