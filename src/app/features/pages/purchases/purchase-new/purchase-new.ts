import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { Api } from '../../../../api/api';
import { supplierGetall, productGetall } from '../../../../api/functions';
import { DecimalPipe } from '@angular/common';

interface ItemCompra {
  id: string;
  idProduct: string | null;
  code: string;
  expirationDate: Date | null;
  quantity: number;
  unitCost: number;
}

@Component({
  selector: 'app-purchase-new',
  imports: [FormsModule, InputTextModule, InputNumberModule, SelectModule, DatePickerModule, DialogModule, DecimalPipe],
  templateUrl: './purchase-new.html',
  styleUrl: './purchase-new.css',
})
export class PurchaseNew {
  private readonly api = inject(Api);

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() compraCreada = new EventEmitter<void>();

  idSupplier = signal<string | null>(null);
  observation = signal<string>('');

  items = signal<ItemCompra[]>([]);

  proveedores = signal<any[]>([]);
  productos = signal<any[]>([]);

  error = signal<string>('');
  guardando = signal<boolean>(false);

  totalUnidades = computed(() =>
    this.items().reduce((acc, i) => acc + (Number(i.quantity) || 0), 0)
  );

  costoTotal = computed(() =>
    this.items().reduce((acc, i) => acc + (Number(i.quantity) || 0) * (Number(i.unitCost) || 0), 0)
  );

  constructor() {
    this.cargarCatalogos();
  }

  private cargarCatalogos(): void {
    this.api.invoke$Response(supplierGetall).then((raw: any) => {
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') {
        this.proveedores.set(data.listSuppliers ?? []);
      }
    }).catch(() => { });

    this.api.invoke$Response(productGetall).then((raw: any) => {
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') {
        this.productos.set(data.listProducts ?? []);
      }
    }).catch(() => { });
  }

  agregarItem(): void {
    this.items.update(list => [
      ...list,
      {
        id: crypto.randomUUID(),
        idProduct: null,
        code: '',
        expirationDate: null,
        quantity: 1,
        unitCost: 0,
      },
    ]);
  }

  quitarItem(index: number): void {
    this.items.update(list => list.filter((_, i) => i !== index));
  }

  private resetForm(): void {
    this.idSupplier.set(null);
    this.observation.set('');
    this.items.set([]);
    this.error.set('');
  }

  cerrar(): void {
    this.resetForm();
    this.visibleChange.emit(false);
  }

  guardar(): void {
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}