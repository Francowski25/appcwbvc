import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Api } from '../../../api/api';
import { saleGetall, productGetall } from '../../../api/functions';
import { ChartModule } from 'primeng/chart';
import { Router } from '@angular/router';

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-seller-dashboard',
  imports: [DatePipe, DecimalPipe, ChartModule],
  templateUrl: './seller-dashboard.html',
})
export class SellerDashboard implements OnInit {
  private readonly api = inject(Api);
  private readonly router = inject(Router);

  today: Date = new Date();
  user = (() => {
    const raw = localStorage.getItem('current_user');
    return raw ? JSON.parse(raw) : null;
  })();

  ventas = signal<any[]>([]);
  productos = signal<any[]>([]);
  loading = signal<boolean>(true);

  misVentas = computed(() =>
    this.ventas().filter(v => v.userName === `${this.user?.firstName} ${this.user?.surName}`)
  );

  misVentasHoy = computed(() => {
    const hoy = new Date().toDateString();
    return this.misVentas().filter(v => {
      if (!v.saleDate) return false;
      return new Date(v.saleDate).toDateString() === hoy;
    });
  });

  misVentasHoyCount = computed(() => this.misVentasHoy().length);

  montoHoy = computed(() =>
    this.misVentasHoy()
      .filter(v => v.status === 'Completada')
      .reduce((acc, v) => acc + Number(v.total ?? 0), 0)
  );

  ticketPromedio = computed(() => {
    const completadas = this.misVentasHoy().filter(v => v.status === 'Completada');
    if (completadas.length === 0) return 0;
    return this.montoHoy() / completadas.length;
  });

  alertasStock = computed(() =>
    this.productos()
      .filter(p => Number(p.totalStock) <= Number(p.stockMinimum))
      .slice(0, 4)
  );

  stockCritico = computed(() =>
    this.productos().filter(p => Number(p.totalStock) <= Number(p.stockMinimum)).length
  );

  misUltimasVentas = computed(() =>
    this.misVentas()
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
      .slice(0, 5)
  );

  lineChartData = computed(() => {
    const agrupado: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const key = fecha.toISOString().substring(0, 10);
      agrupado[key] = 0;
    }
    this.misVentas()
      .filter(v => v.status === 'Completada')
      .forEach(v => {
        const fecha = v.saleDate?.substring(0, 10);
        if (fecha && agrupado.hasOwnProperty(fecha)) {
          agrupado[fecha] += Number(v.total ?? 0);
        }
      });

    const labels = Object.keys(agrupado).map(f => {
      const d = new Date(f + 'T00:00:00');
      return d.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit' });
    });

    return {
      labels,
      datasets: [{
        label: 'Mis ventas (S/)',
        data: Object.values(agrupado),
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236,72,153,0.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ec4899',
        pointRadius: 4,
      }]
    };
  });

  lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  totalSemana = computed(() =>
    this.misVentas()
      .filter(v => {
        if (!v.saleDate) return false;
        const hace7 = new Date();
        hace7.setDate(hace7.getDate() - 7);
        return new Date(v.saleDate) >= hace7 && v.status === 'Completada';
      })
      .reduce((acc, v) => acc + Number(v.total ?? 0), 0)
  );

  ngOnInit(): void {
    this.loadAll();
  }

  private async loadAll(): Promise<void> {
    this.loading.set(true);
    await Promise.all([this.loadVentas(), this.loadProductos()]);
    this.loading.set(false);
  }

  private async loadVentas(): Promise<void> {
    try {
      const raw: any = await this.api.invoke$Response(saleGetall);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') this.ventas.set(data.listSales ?? []);
    } catch { }
  }

  private async loadProductos(): Promise<void> {
    try {
      const raw: any = await this.api.invoke$Response(productGetall);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') this.productos.set(data.listProducts ?? []);
    } catch { }
  }

  getHora(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  irANuevaVenta(): void { this.router.navigate(['/vendedor/sales/new']); }
  irAClientes(): void { this.router.navigate(['/vendedor/customers']); }
  irACatalogo(): void { this.router.navigate(['/vendedor/products']); }
  irAHistorial(): void { this.router.navigate(['/vendedor/sales/history']); }

  protected readonly Number = Number;
}