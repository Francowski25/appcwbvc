import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Api } from '../../../api/api';
import { ChartModule } from 'primeng/chart';
import { productGetall, purchaseRecent, saleKpi, saleRecent, saleTopProduct, saleWeek, userGetall } from '../../../api/functions';

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, DecimalPipe, ChartModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly api = inject(Api);

  today: Date = new Date();
  user = (() => {
    const raw = localStorage.getItem('current_user');
    return raw ? JSON.parse(raw) : null;
  })();

  // --- Signals ---
  kpi = signal<any>(null);
  salesWeek = signal<any[]>([]);
  topProducts = signal<any[]>([]);
  recentSales = signal<any[]>([]);
  recentPurchases = signal<any[]>([]);
  productos = signal<any[]>([]);
  usuarios = signal<any[]>([]);

  loading = signal<boolean>(true);

  // --- KPIs computados ---
  pctVentas = computed(() => {
    const kpi = this.kpi();
    if (!kpi || !kpi.ventasAyer || kpi.ventasAyer === 0) return null;
    const pct = ((kpi.ventasHoy - kpi.ventasAyer) / kpi.ventasAyer) * 100;
    return Math.round(pct);
  });

  // --- Inventario resumen (calculado de productos) ---
  productosOk = computed(() =>
    this.productos().filter(p => Number(p.totalStock) > Number(p.stockMinimum)).length
  );

  stockCriticoLocal = computed(() =>
    this.productos().filter(p =>
      Number(p.totalStock) > 0 && Number(p.totalStock) <= Number(p.stockMinimum)
    ).length
  );

  agotadosLocal = computed(() =>
    this.productos().filter(p => Number(p.totalStock) === 0).length
  );

  valorAlmacen = computed(() =>
    this.productos().reduce((acc, p) =>
      acc + (Number(p.totalStock) * Number(p.priceSale)), 0)
  );

  // --- Alertas (stock bajo + por vencer) ---
  alertasStock = computed(() =>
    this.productos()
      .filter(p => Number(p.totalStock) <= Number(p.stockMinimum))
      .slice(0, 3)
  );

  alertasVencimiento = computed(() => {
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + 30);
    return this.productos()
      .filter(p => {
        if (!p.nextExpiration) return false;
        const fecha = new Date(p.nextExpiration);
        return fecha <= limite && fecha >= hoy;
      })
      .slice(0, 2);
  });

  totalAlertas = computed(() =>
    this.alertasStock().length + this.alertasVencimiento().length
  );

  // --- Gráfica ventas semana ---
  lineChartData = computed(() => ({
    labels: this.salesWeek().map(s => s.dia),
    datasets: [{
      label: 'Ventas (S/)',
      data: this.salesWeek().map(s => s.total),
      borderColor: '#ec4899',
      backgroundColor: 'rgba(236, 72, 153, 0.08)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#ec4899',
      pointRadius: 4,
    }]
  }));

  lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 50 } }
    }
  };

  totalSemana = computed(() =>
    this.salesWeek().reduce((acc, s) => acc + Number(s.total), 0)
  );

  // --- Top productos (barra de progreso) ---
  topProductosConPct = computed(() => {
    const lista = this.topProducts();
    if (lista.length === 0) return [];
    const max = Math.max(...lista.map(p => Number(p.totalQty)));
    return lista.map(p => ({
      ...p,
      pct: max > 0 ? Math.round((Number(p.totalQty) / max) * 100) : 0
    }));
  });

  // --- Usuarios top 5 ---
  top5Usuarios = computed(() => this.usuarios().slice(0, 5));

  ngOnInit(): void {
    this.loadAll();
  }

  private async loadAll(): Promise<void> {
    this.loading.set(true);
    try {
      await Promise.all([
        this.loadKpi(),
        this.loadSalesWeek(),
        this.loadTopProducts(),
        this.loadRecentSales(),
        this.loadRecentPurchases(),
        this.loadProductos(),
        this.loadUsuarios(),
      ]);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadKpi(): Promise<void> {
    try {
      const raw: any = await this.api.invoke$Response(saleKpi);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') this.kpi.set(data.kpi);
    } catch { }
  }

  private async loadSalesWeek(): Promise<void> {
    try {
      const raw: any = await this.api.invoke$Response(saleWeek);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') this.salesWeek.set(data.listSalesWeek ?? []);
    } catch { }
  }

  private async loadTopProducts(): Promise<void> {
    try {
      const raw: any = await this.api.invoke$Response(saleTopProduct);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') this.topProducts.set(data.listTopProducts ?? []);
    } catch { }
  }

  private async loadRecentSales(): Promise<void> {
    try {
      const raw: any = await this.api.invoke$Response(saleRecent);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') this.recentSales.set(data.listSales ?? []);
    } catch { }
  }

  private async loadRecentPurchases(): Promise<void> {
    try {
      const raw: any = await this.api.invoke$Response(purchaseRecent);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') this.recentPurchases.set(data.listPurchases ?? []);
    } catch { }
  }

  private async loadProductos(): Promise<void> {
    try {
      const raw: any = await this.api.invoke$Response(productGetall);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') this.productos.set(data.listProducts ?? []);
    } catch { }
  }

  private async loadUsuarios(): Promise<void> {
    try {
      const raw: any = await this.api.invoke$Response(userGetall);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') this.usuarios.set(data.listUsers ?? []);
    } catch { }
  }

  getHora(dateStr: string): string {
    if (!dateStr) return '—';
    const fecha = new Date(dateStr);
    return fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  getFechaCorta(dateStr: string): string {
    if (!dateStr) return '—';
    const fecha = new Date(dateStr);
    return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  }

  protected readonly Number = Number;
  protected readonly Math = Math;
}