import { Component, signal, computed, inject } from '@angular/core';
import { Api } from '../../../../api/api';
import { purchaseReport, purchaseReportBysupplier } from '../../../../api/functions';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-report-purchases',
  imports: [ChartModule, TableModule, ButtonModule, DecimalPipe],
  templateUrl: './report-purchases.html',
})
export class ReportPurchases {
  private readonly api = inject(Api);

  from = signal<string>(this.getFirstDayOfMonth());
  to = signal<string>(this.getTodayStr());
  loading = signal<boolean>(false);
  error = signal<string>('');
  generated = signal<boolean>(false);

  resumen = signal<any>(null);
  detalle = signal<any[]>([]);
  porProveedor = signal<any[]>([]);

  barProveedorData = computed(() => {
    const top = this.porProveedor().slice(0, 8);
    return {
      labels: top.map(p => p.supplierName),
      datasets: [{
        label: 'Inversión (S/)',
        data: top.map(p => Number(p.totalMonto)),
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

  donaProveedorData = computed(() => {
    const top = this.porProveedor().slice(0, 6);
    const colores = ['#ec4899', '#3b82f6', '#f97316', '#22c55e', '#8b5cf6', '#06b6d4'];
    return {
      labels: top.map(p => p.supplierName),
      datasets: [{
        data: top.map(p => Number(p.totalMonto)),
        backgroundColor: colores,
        hoverOffset: 8,
      }]
    };
  });

  donaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } }
  };

  topProveedores = computed(() => {
    const lista = this.porProveedor().slice(0, 8);
    const max = Math.max(...lista.map(p => Number(p.totalMonto)));
    return lista.map(p => ({
      ...p,
      pct: max > 0 ? Math.round((Number(p.totalMonto) / max) * 100) : 0
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
      const [r1, r2] = await Promise.all([
        this.api.invoke$Response(purchaseReport, params),
        this.api.invoke$Response(purchaseReportBysupplier, params),
      ]);
      const d1 = this.parse(r1);
      const d2 = this.parse(r2);
      if (d1.type === 'success') {
        this.resumen.set(d1.resumen);
        this.detalle.set(d1.detalle ?? []);
      }
      if (d2.type === 'success') this.porProveedor.set(d2.detalle ?? []);
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
    this.porProveedor.set([]);
    this.generated.set(false);
    this.error.set('');
  }

  private parse(raw: any): any {
    return typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
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