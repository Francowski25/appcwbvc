import { Component, input, output, signal, computed, inject, effect } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { DecimalPipe } from '@angular/common';
import { Api } from '../../../../api/api';
import { customerGetall, customerInsert, lotByproduct, saleInsert } from '../../../../api/functions';

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
  loadingCliente = signal<boolean>(false);
  error = signal<string>('');

  tieneCliente = signal<boolean>(false);
  clienteSeleccionado = signal<any>(null);
  showNuevoCliente = signal<boolean>(false);
  nuevoCliente = signal({ documentType: 'DNI', documentNumber: '', name: '' });

  metodoPago = signal<string>('Efectivo');
  items = signal<ItemVenta[]>([]);
  descuento = signal<number>(0);
  busquedaProducto = signal<string>('');
  showProductSearch = signal<boolean>(false);

  metodos = ['Efectivo', 'Tarjeta', 'Yape', 'Plin'];

  subtotal = computed(() => this.items().reduce((acc, i) => acc + i.subtotal, 0));
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
      if (!this.visible()) this.resetForm();
    });
  }

  resetForm(): void {
    this.tieneCliente.set(false);
    this.clienteSeleccionado.set(null);
    this.showNuevoCliente.set(false);
    this.nuevoCliente.set({ documentType: 'DNI', documentNumber: '', name: '' });
    this.metodoPago.set('Efectivo');
    this.items.set([]);
    this.descuento.set(0);
    this.busquedaProducto.set('');
    this.showProductSearch.set(false);
    this.error.set('');
  }

  onSeleccionarCliente(idCustomer: string): void {
    const cliente = this.clientes().find(c => c.idCustomer === idCustomer);
    if (cliente) this.clienteSeleccionado.set(cliente);
  }

  async onAgregarProducto(producto: any): Promise<void> {
    if (this.items().find(i => i.idProduct === producto.idProduct)) {
      this.error.set('El producto ya está en la lista.');
      return;
    }
    try {
      const raw: any = await this.api.invoke$Response(lotByproduct, { idProduct: producto.idProduct });
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      const lotes = data.type === 'success' ? (data.listLots ?? []) : [];
      const primerLote = lotes.find((l: any) => Number(l.currentStock) > 0);
      if (!primerLote) {
        this.error.set(`Sin stock disponible para ${producto.name}.`);
        return;
      }
      this.items.update(list => [...list, {
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
      }]);
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

  async onGuardarNuevoCliente(): Promise<void> {
    if (!this.nuevoCliente().documentNumber.trim() || !this.nuevoCliente().name.trim()) {
      this.error.set('Documento y nombre son obligatorios.');
      return;
    }
    this.loadingCliente.set(true);
    this.error.set('');
    try {
      const raw: any = await this.api.invoke$Response(customerInsert, { body: { ...this.nuevoCliente() } });
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type !== 'success') {
        this.error.set(data.listMessage[0] ?? 'Error al guardar cliente.');
        return;
      }
      const rawClientes: any = await this.api.invoke$Response(customerGetall);
      const dataClientes = typeof rawClientes.body === 'string' ? JSON.parse(rawClientes.body) : rawClientes.body;
      if (dataClientes.type === 'success') {
        const nuevo = (dataClientes.listCustomers ?? []).find((c: any) =>
          c.documentNumber === this.nuevoCliente().documentNumber
        );
        if (nuevo) this.clienteSeleccionado.set(nuevo);
      }
      this.showNuevoCliente.set(false);
      this.nuevoCliente.set({ documentType: 'DNI', documentNumber: '', name: '' });
    } catch {
      this.error.set('Error al guardar cliente.');
    } finally {
      this.loadingCliente.set(false);
    }
  }

  async onGuardar(): Promise<void> {
    this.error.set('');
    if (this.items().length === 0) {
      this.error.set('Agrega al menos un producto.');
      return;
    }
    if (this.tieneCliente() && !this.clienteSeleccionado()) {
      this.error.set('Selecciona o registra un cliente.');
      return;
    }
    const user = (() => {
      const raw = localStorage.getItem('current_user');
      return raw ? JSON.parse(raw) : null;
    })();
    const payload = {
      body: {
        idCustomer: this.clienteSeleccionado()?.idCustomer ?? null,
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