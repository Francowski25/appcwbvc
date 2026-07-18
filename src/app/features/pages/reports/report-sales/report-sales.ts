import { Component, signal, computed, inject } from '@angular/core';
import { Api } from '../../../../api/api';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DecimalPipe } from '@angular/common';
import { saleReport, saleReportByproduct, saleReportByuser } from '../../../../api/functions';

@Component({
  selector: 'app-report-sales',
  imports: [ChartModule, TableModule, ButtonModule, DecimalPipe],
  templateUrl: './report-sales.html',
})
export class ReportSales {
  private readonly api = inject(Api);

  from = signal<string>(this.getFirstDayOfMonth());
  to = signal<string>(this.getTodayStr());
  loading = signal<boolean>(false);
  error = signal<string>('');
  generated = signal<boolean>(false);

  resumen = signal<any>(null);
  detalle = signal<any[]>([]);
  porUsuario = signal<any[]>([]);
  porProducto = signal<any[]>([]);

  // --- Gráfica línea: ventas por día ---
  lineChartData = computed(() => {
    const agrupado: Record<string, number> = {};
    this.detalle().forEach(v => {
      const fecha = v.saleDate?.substring(0, 10) ?? '—';
      agrupado[fecha] = (agrupado[fecha] ?? 0) + Number(v.total);
    });
    const labels = Object.keys(agrupado).sort();
    return {
      labels,
      datasets: [{
        label: 'Ventas (S/)',
        data: labels.map(l => agrupado[l]),
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

  // --- Gráfica dona: métodos de pago ---
  donaMetodosData = computed(() => {
    const agrupado: Record<string, number> = {};
    this.detalle().forEach(v => {
      const m = v.paymentMethod ?? 'Otro';
      agrupado[m] = (agrupado[m] ?? 0) + 1;
    });
    return {
      labels: Object.keys(agrupado),
      datasets: [{
        data: Object.values(agrupado),
        backgroundColor: ['#ec4899', '#3b82f6', '#f97316', '#22c55e'],
        hoverOffset: 8,
      }]
    };
  });

  donaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } }
  };

  // --- Gráfica barras: top vendedores ---
  barVendedoresData = computed(() => {
    const top = this.porUsuario().slice(0, 6);
    return {
      labels: top.map(u => u.userName),
      datasets: [{
        label: 'Monto (S/)',
        data: top.map(u => Number(u.totalMonto)),
        backgroundColor: '#ec4899',
        borderRadius: 6,
      }]
    };
  });

  barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  // --- Top productos con porcentaje ---
  topProductos = computed(() => {
    const lista = this.porProducto().slice(0, 8);
    const max = Math.max(...lista.map(p => Number(p.totalQty)));
    return lista.map(p => ({
      ...p,
      pct: max > 0 ? Math.round((Number(p.totalQty) / max) * 100) : 0
    }));
  });

  async onGenerar(): Promise<void> {
    if (!this.from() || !this.to()) {
      this.error.set('Selecciona un período válido.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.generated.set(false);
    try {
      const params = { from: this.from(), to: this.to() };
      const [r1, r2, r3] = await Promise.all([
        this.api.invoke$Response(saleReport, params),
        this.api.invoke$Response(saleReportByuser, params),
        this.api.invoke$Response(saleReportByproduct, params),
      ]);
      const d1 = this.parse(r1);
      const d2 = this.parse(r2);
      const d3 = this.parse(r3);
      if (d1.type === 'success') {
        this.resumen.set(d1.resumen);
        this.detalle.set(d1.detalle ?? []);
      }
      if (d2.type === 'success') this.porUsuario.set(d2.detalle ?? []);
      if (d3.type === 'success') this.porProducto.set(d3.detalle ?? []);
      this.generated.set(true);
    } catch {
      this.error.set('Error al generar el reporte.');
    } finally {
      this.loading.set(false);
    }
  }

  onLimpiar(): void {
    this.from.set(this.getFirstDayOfMonth());
    this.to.set(this.getTodayStr());
    this.resumen.set(null);
    this.detalle.set([]);
    this.porUsuario.set([]);
    this.porProducto.set([]);
    this.generated.set(false);
    this.error.set('');
  }

  private parse(raw: any): any {
    const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
    return data;
  }

  private getFirstDayOfMonth(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }

  private getTodayStr(): string {
    return new Date().toISOString().substring(0, 10);
  }

  protected readonly Number = Number;
}