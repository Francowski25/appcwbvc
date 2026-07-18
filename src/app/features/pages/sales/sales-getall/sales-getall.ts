import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../../../../api/api';
import { saleGetall } from '../../../../api/functions';
import { SalesKpi } from '../sales-kpi/sales-kpi';
import { SalesSidebar } from '../sales-sidebar/sales-sidebar';
import { SalesTable } from '../sales-table/sales-table';
import { SalesDetail } from '../sales-detail/sales-detail';

@Component({
  selector: 'app-sales-getall',
  imports: [SalesKpi, SalesSidebar, SalesTable, SalesDetail],
  templateUrl: './sales-getall.html',
})
export class SalesGetall implements OnInit {
  private readonly api = inject(Api);
  private readonly router = inject(Router);

  ventas = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  busqueda = signal<string>('');
  metodoPagoSeleccionado = signal<string>('');
  estadoSeleccionado = signal<string>('');

  ventaSeleccionada = signal<any>(null);
  showDetail = signal<boolean>(false);

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
    return completadas.reduce((acc, v) => acc + Number(v.total ?? 0), 0) / completadas.length;
  });

  metodosPago = computed(() =>
    this.ventas().reduce((acc: any[], v: any) => {
      const metodo = v.paymentMethod || 'Otro';
      const existing = acc.find(m => m.name === metodo);
      existing ? existing.count++ : acc.push({ name: metodo, count: 1 });
      return acc;
    }, [])
  );

  ngOnInit(): void {
    this.loadVentas();
  }

  private async loadVentas(): Promise<void> {
    this.loading.set(true);
    try {
      const raw: any = await this.api.invoke$Response(saleGetall);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') this.ventas.set(data.listSales ?? []);
      else this.error.set(data.listMessage[0] ?? 'Error al cargar ventas.');
    } catch {
      this.error.set('Error al cargar ventas.');
    } finally {
      this.loading.set(false);
    }
  }

  onBusqueda(value: string): void { this.busqueda.set(value); }
  onMetodoPagoChange(value: string): void { this.metodoPagoSeleccionado.set(value); }
  onEstadoChange(value: string): void { this.estadoSeleccionado.set(value); }
  onLimpiarFiltros(): void {
    this.busqueda.set('');
    this.metodoPagoSeleccionado.set('');
    this.estadoSeleccionado.set('');
  }

  onVerDetalle(venta: any): void {
    this.ventaSeleccionada.set(venta);
    this.showDetail.set(true);
  }

  onNuevaVenta(): void {
    this.router.navigate(['/admin/ventas/nueva']);
  }

  protected readonly Number = Number;
}