import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Api } from '../../../../api/api';
import { productGetall, inventoryReportMovements, inventoryReportExpiring } from '../../../../api/functions';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-report-inventory',
  imports: [ChartModule, TableModule, ButtonModule, DecimalPipe],
  templateUrl: './report-inventory.html',
})
export class ReportInventory implements OnInit {
  private readonly api = inject(Api);

  from = signal<string>(this.getFirstDayOfMonth());
  to = signal<string>(this.getTodayStr());
  loading = signal<boolean>(false);
  loadingStatic = signal<boolean>(true);
  error = signal<string>('');
  generated = signal<boolean>(false);

  productos = signal<any[]>([]);
  movimientos = signal<any[]>([]);
  lotesVencer = signal<any[]>([]);

  // --- KPIs estáticos (siempre visibles) ---
  stockCritico = computed(() =>
    this.productos().filter(p => Number(p.totalStock) <= Number(p.stockMinimum)).length
  );

  agotados = computed(() =>
    this.productos().filter(p => Number(p.totalStock) === 0).length
  );

  valorAlmacen = computed(() =>
    this.productos().reduce((acc, p) =>
      acc + (Number(p.totalStock) * Number(p.priceSale)), 0)
  );

  // --- Gráfica: stock actual vs mínimo (top 10 críticos) ---
  barStockData = computed(() => {
    const top10 = this.productos()
      .filter(p => Number(p.totalStock) <= Number(p.stockMinimum))
      .slice(0, 10);
    return {
      labels: top10.map(p => p.name),
      datasets: [
        {
          label: 'Stock actual',
          data: top10.map(p => Number(p.totalStock)),
          backgroundColor: '#ef4444',
          borderRadius: 4,
        },
        {
          label: 'Stock mínimo',
          data: top10.map(p => Number(p.stockMinimum)),
          backgroundColor: '#fca5a5',
          borderRadius: 4,
        }
      ]
    };
  });

  productosStockBajo = computed(() =>
    this.productos().filter(p => Number(p.totalStock) <= Number(p.stockMinimum))
  );

  barStockOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } },
    scales: { y: { beginAtZero: true } }
  };

  // --- Gráfica dona: movimientos por tipo ---
  donaMovimientosData = computed(() => {
    const agrupado: Record<string, number> = {};
    this.movimientos().forEach(m => {
      const tipo = m.type ?? 'Otro';
      agrupado[tipo] = (agrupado[tipo] ?? 0) + 1;
    });
    return {
      labels: Object.keys(agrupado),
      datasets: [{
        data: Object.values(agrupado),
        backgroundColor: ['#22c55e', '#ef4444', '#3b82f6', '#f97316'],
        hoverOffset: 8,
      }]
    };
  });

  donaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } }
  };

  ngOnInit(): void {
    this.loadStatic();
  }

  private async loadStatic(): Promise<void> {
    this.loadingStatic.set(true);
    try {
      const raw: any = await this.api.invoke$Response(productGetall);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') this.productos.set(data.listProducts ?? []);
    } catch { } finally {
      this.loadingStatic.set(false);
    }
  }

  async onGenerar(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    this.generated.set(false);
    try {
      const params = { from: this.from(), to: this.to() };
      const [r1, r2] = await Promise.all([
        this.api.invoke$Response(inventoryReportMovements, params),
        this.api.invoke$Response(inventoryReportExpiring),
      ]);
      const d1 = this.parse(r1);
      const d2 = this.parse(r2);
      if (d1.type === 'success') this.movimientos.set(d1.detalle ?? []);
      if (d2.type === 'success') this.lotesVencer.set(d2.detalle ?? []);
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
    this.movimientos.set([]);
    this.lotesVencer.set([]);
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