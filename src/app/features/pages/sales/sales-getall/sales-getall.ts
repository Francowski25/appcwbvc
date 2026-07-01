import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Api } from '../../../../api/api';
import { SalesKpi } from '../sales-kpi/sales-kpi';
import { SalesSidebar } from '../sales-sidebar/sales-sidebar';
import { SalesTable } from '../sales-table/sales-table';
import { SalesNew } from '../sales-new/sales-new';
import { SalesDetail } from '../sales-detail/sales-detail';
import { productGetall, saleGetall } from '../../../../api/functions';

@Component({
  selector: 'app-sales-getall',
  imports: [SalesKpi, SalesSidebar, SalesTable, SalesNew, SalesDetail],
  templateUrl: './sales-getall.html',
})
export class SalesGetall implements OnInit {
  private readonly api = inject(Api);

  ventas = signal<any[]>([]);
  clientes = signal<any[]>([]);
  productos = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  busqueda = signal<string>('');
  metodoPagoSeleccionado = signal<string>('');
  estadoSeleccionado = signal<string>('');

  ventaSeleccionada = signal<any>(null);
  showNew = signal<boolean>(false);
  showDetail = signal<boolean>(false);

  // --- Filtrados ---
  filtrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const metodo = this.metodoPagoSeleccionado();
    const estado = this.estadoSeleccionado();

    let lista = this.ventas();
    if (metodo) lista = lista.filter(v => v.paymentMethod === metodo);
    if (estado) lista = lista.filter(v => v.status === estado);
    if (q) lista = lista.filter(v =>
      v.customerName?.toLowerCase().includes(q) ||
      v.saleNumber?.toLowerCase().includes(q) ||
      v.userName?.toLowerCase().includes(q)
    );
    return lista;
  });

  // --- KPIs ---
  totalVentas = computed(() => this.ventas().length);

  montoTotal = computed(() =>
    this.ventas()
      .filter(v => v.status === 'Completada')
      .reduce((acc, v) => acc + Number(v.total ?? 0), 0)
  );

  ventasHoy = computed(() => {
    const hoy = new Date().toDateString();
    return this.ventas().filter(v => {
      if (!v.saleDate) return false;
      return new Date(v.saleDate).toDateString() === hoy;
    }).length;
  });

  ticketPromedio = computed(() => {
    const completadas = this.ventas().filter(v => v.status === 'Completada');
    if (completadas.length === 0) return 0;
    const total = completadas.reduce((acc, v) => acc + Number(v.total ?? 0), 0);
    return total / completadas.length;
  });

  // --- Sidebar ---
  metodosPago = computed(() => {
    return this.ventas().reduce((acc: any[], v: any) => {
      const metodo = v.paymentMethod || 'Otro';
      const existing = acc.find(m => m.name === metodo);
      existing ? existing.count++ : acc.push({ name: metodo, count: 1 });
      return acc;
    }, []);
  });

  ngOnInit(): void {
    this.loadAll();
  }

  private async loadAll(): Promise<void> {
    this.loading.set(true);
    await Promise.all([
      this.loadVentas(),
      this.loadClientes(),
      this.loadProductos(),
    ]);
    this.loading.set(false);
  }

  private async loadVentas(): Promise<void> {
    try {
      const raw: any = await this.api.invoke$Response(saleGetall);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') this.ventas.set(data.listSales ?? []);
      else this.error.set(data.listMessage[0] ?? 'Error al cargar ventas.');
    } catch { this.error.set('Error al cargar ventas.'); }
  }

  private async loadClientes(): Promise<void> {
    try {
      const raw: any = await this.api.invoke$Response(customerGetall);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') this.clientes.set(data.listCustomers ?? []);
    } catch { }
  }

  private async loadProductos(): Promise<void> {
    try {
      const raw: any = await this.api.invoke$Response(productGetall);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') this.productos.set(data.listProducts ?? []);
    } catch { }
  }

  onBusqueda(value: string): void { this.busqueda.set(value); }
  onMetodoPagoChange(value: string): void { this.metodoPagoSeleccionado.set(value); }
  onEstadoChange(value: string): void { this.estadoSeleccionado.set(value); }
  onLimpiarFiltros(): void {
    this.busqueda.set('');
    this.metodoPagoSeleccionado.set('');
    this.estadoSeleccionado.set('');
  }

  onNuevaVenta(): void { this.showNew.set(true); }

  onVerDetalle(venta: any): void {
    this.ventaSeleccionada.set(venta);
    this.showDetail.set(true);
  }

  onVentaGuardada(): void {
    this.showNew.set(false);
    this.loadVentas();
  }

  protected readonly Number = Number;
}