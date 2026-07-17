import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Api } from '../../../../api/api';
import { customerGetall, customerInsert, lotByproduct, productGetall, saleInsert } from '../../../../api/functions';
import { DecimalPipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ExportPDFData, ExportService } from '../../../../services/export.service';

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
  standalone: true,
  imports: [DecimalPipe, ToastModule],
  templateUrl: './sales-new.html',
})
export class SalesNew implements OnInit {
  private readonly api = inject(Api);
  private readonly messageService = inject(MessageService);
  private readonly exportService = inject(ExportService); // Inyectamos el servicio de exportación

  clientes = signal<any[]>([]);
  productos = signal<any[]>([]);
  loading = signal<boolean>(false);
  loadingCliente = signal<boolean>(false);
  loadingData = signal<boolean>(true);

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

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loadingData.set(true);
    await Promise.all([this.loadClientes(), this.loadProductos()]);
    this.loadingData.set(false);
  }

  private async loadClientes(): Promise<void> {
    try {
      const raw: any = await this.api.invoke$Response(customerGetall);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') {
        this.clientes.set(data.listCustomers ?? []);
      }
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los clientes.',
        life: 4000
      });
    }
  }

  private async loadProductos(): Promise<void> {
    try {
      const raw: any = await this.api.invoke$Response(productGetall);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') {
        this.productos.set(data.listProducts ?? []);
      }
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los productos.',
        life: 4000
      });
    }
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
  }

  onSeleccionarCliente(idCustomer: string): void {
    const cliente = this.clientes().find(c => c.idCustomer === idCustomer);
    if (cliente) this.clienteSeleccionado.set(cliente);
  }

  async onAgregarProducto(producto: any): Promise<void> {
    if (this.items().find(i => i.idProduct === producto.idProduct)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Producto duplicado',
        detail: 'El producto ya ha sido agregado a la lista.',
        life: 4000
      });
      return;
    }
    try {
      const raw: any = await this.api.invoke$Response(lotByproduct, { idProduct: producto.idProduct });
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      const lotes = data.type === 'success' ? (data.listLots ?? []) : [];
      const primerLote = lotes.find((l: any) => Number(l.currentStock) > 0);

      if (!primerLote) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Sin stock',
          detail: `No hay unidades disponibles para ${producto.name}.`,
          life: 4000
        });
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
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Fallo al cargar los lotes del producto.',
        life: 4000
      });
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
      this.messageService.add({
        severity: 'error',
        summary: 'Campos incompletos',
        detail: 'El documento y el nombre son obligatorios.',
        life: 4000
      });
      return;
    }
    this.loadingCliente.set(true);
    try {
      const raw: any = await this.api.invoke$Response(customerInsert, { body: { ...this.nuevoCliente() } });
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type !== 'success') {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al registrar',
          detail: data.listMessage[0] ?? 'Error al guardar cliente.',
          life: 5000
        });
        return;
      }
      await this.loadClientes();
      const nuevo = this.clientes().find(c => c.documentNumber === this.nuevoCliente().documentNumber);
      if (nuevo) this.clienteSeleccionado.set(nuevo);
      this.showNuevoCliente.set(false);
      this.nuevoCliente.set({ documentType: 'DNI', documentNumber: '', name: '' });
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cliente registrado correctamente.',
        life: 4000
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de red',
        detail: 'No se pudo guardar el cliente en el servidor.',
        life: 4000
      });
    } finally {
      this.loadingCliente.set(false);
    }
  }

  async onGuardar(): Promise<void> {
    if (this.items().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Faltan productos',
        detail: 'Agrega al menos un producto a la lista de ventas.',
        life: 4000
      });
      return;
    }
    if (this.tieneCliente() && !this.clienteSeleccionado()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Falta cliente',
        detail: 'Selecciona o registra un cliente para continuar.',
        life: 4000
      });
      return;
    }

    // ABRIMOS LA PESTAÑA INMEDIATAMENTE (Evita el bloqueo del navegador)
    const nuevaPestana = window.open('', '_blank');
    if (nuevaPestana) {
      nuevaPestana.document.write(`
        <html>
          <head>
            <title>Generando Boleta...</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; color: #374151; background: #f9fafb; margin: 0; }
              .loader { border: 4px solid #f3f3f3; border-top: 4px solid #db2777; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              .container { text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="loader" style="margin: 0 auto 15px auto;"></div>
              <p>Generando su boleta electrónica de venta, por favor espere...</p>
            </div>
          </body>
        </html>
      `);
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
    let data: any = null;

    try {
      const raw: any = await this.api.invoke$Response(saleInsert, payload);
      data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
    } catch (httpError) {
      console.error('Error de red:', httpError);
      if (nuevaPestana) nuevaPestana.close();
      this.messageService.add({
        severity: 'error',
        summary: 'Sin conexión',
        detail: 'No se pudo establecer conexión con el servidor.',
        life: 5000
      });
      this.loading.set(false);
      return;
    }

    if (data && data.type !== 'success') {
      if (nuevaPestana) nuevaPestana.close();
      this.messageService.add({
        severity: 'error',
        summary: 'Error en registro',
        detail: data.listMessage?.[0] ?? 'Ocurrió un problema al registrar la venta.',
        life: 5000
      });
      this.loading.set(false);
      return;
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Venta exitosa',
      detail: 'Venta registrada. Abriendo boleta...',
      life: 4000
    });

    const idNuevaVenta = data?.idSale || 'VENTA_TEMP';

    const exportData: ExportPDFData = {
      idSale: idNuevaVenta,
      cliente: this.clienteSeleccionado() ? {
        name: this.clienteSeleccionado().name,
        documentType: this.clienteSeleccionado().documentType,
        documentNumber: this.clienteSeleccionado().documentNumber
      } : null,
      metodoPago: this.metodoPago(),
      items: this.items().map(i => ({
        productName: i.productName,
        lotCode: i.lotCode,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.subtotal
      })),
      subtotal: this.subtotal(),
      descuento: this.descuento(),
      igv: this.igv(),
      total: this.total()
    };

    try {
      this.exportService.generarPDFConPestana(exportData, nuevaPestana);
    } catch (pdfError) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Error de Impresión',
        detail: 'La venta se guardó pero no se pudo abrir la boleta automáticamente.',
        life: 6000
      });
    }

    this.resetForm();
    this.loading.set(false);
  }

  protected readonly Number = Number;
}