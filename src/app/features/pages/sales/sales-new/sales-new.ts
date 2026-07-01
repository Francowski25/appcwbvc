import { Component, input, output, signal, computed, inject, effect } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { DecimalPipe } from '@angular/common';
import { Api } from '../../../../api/api';
import { saleInsert } from '../../../../api/functions';

interface ItemVenta {
  idProduct: string;
  productName: string;
  barcode: string;
  idLot: string;
  lotCode: string;
  currentStock: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  lotes: any[];
}

@Component({
  selector: 'app-sales-new',
  imports: [DialogModule, DecimalPipe],
  templateUrl: './sales-new.html',
})
export class SalesNew {
  private readonly api = inject(Api);

  visible = input<boolean>(false);
  clientes = input<any[]>([]);
  productos = input<any[]>([]);

  visibleChange = output<boolean>();
  guardado = output<void>();

  loading = signal<boolean>(false);
  error = signal<string>('');

  clienteSeleccionado = signal<any>(null);
  metodoPago = signal<string>('Efectivo');
  items = signal<ItemVenta[]>([]);
  descuento = signal<number>(0);
  busquedaProducto = signal<string>('');
  showProductSearch = signal<boolean>(false);

  metodos = ['Efectivo', 'Tarjeta', 'Yape', 'Plin'];

  // --- Cálculos ---
  subtotal = computed(() =>
    this.items().reduce((acc, i) => acc + i.subtotal, 0)
  );

  base = computed(() => this.subtotal() - this.descuento());
  igv = computed(() => Math.round(this.base() * 0.18 * 100) / 100);
  total = computed(() => Math.round((this.base() + this.igv()) * 100) / 100);

  productosFiltrados = computed(() => {
    const q = this.busquedaProducto().toLowerCase().trim();
    if (!q) return this.productos().slice(0, 8);
    return this.productos()
      .filter(p => p.name?.toLowerCase().includes(q) || p.barcode?.includes(q))
      .slice(0, 8);
  });

  constructor() {
    effect(() => {
      if (!this.visible()) {
        this.resetForm();
      }
    });
  }

  resetForm(): void {
    this.clienteSeleccionado.set(null);
    this.metodoPago.set('Efectivo');
    this.items.set([]);
    this.descuento.set(0);
    this.busquedaProducto.set('');
    this.showProductSearch.set(false);
    this.error.set('');
  }

  async onAgregarProducto(producto: any): Promise<void> {
    // Verificar si ya está agregado
    const existe = this.items().find(i => i.idProduct === producto.idProduct);
    if (existe) {
      this.error.set('El producto ya está en la lista.');
      return;
    }

    // Cargar lotes del producto
    try {
      const raw: any = await this.api.invoke$Response(lotByProduct, { idProduct: producto.idProduct });
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      const lotes = data.type === 'success' ? (data.listLots ?? []) : [];

      const primerLote = lotes.find((l: any) => Number(l.currentStock) > 0);
      if (!primerLote) {
        this.error.set(`Sin stock disponible para ${producto.name}.`);
        return;
      }

      const nuevoItem: ItemVenta = {
        idProduct: producto.idProduct,
        productName: producto.name,
        barcode: producto.barcode ?? '',
        idLot: primerLote.idLot,
        lotCode: primerLote.code,
        currentStock: Number(primerLote.currentStock),
        quantity: 1,
        unitPrice: Number(producto.priceSale),
        subtotal: Number(producto.priceSale),
        lotes,
      };

      this.items.update(list => [...list, nuevoItem]);
      this.busquedaProducto.set('');
      this.showProductSearch.set(false);
      this.error.set('');

    } catch {
      this.error.set('Error al cargar lotes del producto.');
    }
  }

  onCambiarCantidad(index: number, value: number): void {
    this.items.update(list => {
      const updated = [...list];
      const item = { ...updated[index] };
      item.quantity = Math.max(1, Math.min(value, item.currentStock));
      item.subtotal = Math.round(item.quantity * item.unitPrice * 100) / 100;
      updated[index] = item;
      return updated;
    });
  }

  onCambiarLote(index: number, idLot: string): void {
    this.items.update(list => {
      const updated = [...list];
      const item = { ...updated[index] };
      const lote = item.lotes.find((l: any) => l.idLot === idLot);
      if (lote) {
        item.idLot = lote.idLot;
        item.lotCode = lote.code;
        item.currentStock = Number(lote.currentStock);
        item.quantity = Math.min(item.quantity, item.currentStock);
        item.subtotal = Math.round(item.quantity * item.unitPrice * 100) / 100;
      }
      updated[index] = item;
      return updated;
    });
  }

  onEliminarItem(index: number): void {
    this.items.update(list => list.filter((_, i) => i !== index));
  }

  onDescuento(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.descuento.set(isNaN(val) ? 0 : val);
  }

  onBusquedaProducto(event: Event): void {
    this.busquedaProducto.set((event.target as HTMLInputElement).value);
    this.showProductSearch.set(true);
  }

  async onGuardar(): Promise<void> {
    this.error.set('');

    if (!this.clienteSeleccionado()) {
      this.error.set('Selecciona un cliente.');
      return;
    }

    if (this.items().length === 0) {
      this.error.set('Agrega al menos un producto.');
      return;
    }

    const user = (() => {
      const raw = localStorage.getItem('current_user');
      return raw ? JSON.parse(raw) : null;
    })();

    const payload = {
      body: {
        idCustomer: this.clienteSeleccionado().idCustomer,
        idUser: user?.idUser ?? '',
        paymentMethod: this.metodoPago(),
        discount: this.descuento(),
        items: this.items().map(i => ({
          idProduct: i.idProduct,
          idLot: i.idLot,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        }))
      }
    };

    this.loading.set(true);
    try {
      const raw: any = await this.api.invoke$Response(saleInsert, payload);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type !== 'success') {
        this.error.set(data.listMessage[0] ?? 'Error al registrar venta.');
        return;
      }
      this.guardado.emit();
    } catch {
      this.error.set('Error al registrar venta.');
    } finally {
      this.loading.set(false);
    }
  }

  onCerrar(): void {
    this.visibleChange.emit(false);
  }

  protected readonly Number = Number;
}