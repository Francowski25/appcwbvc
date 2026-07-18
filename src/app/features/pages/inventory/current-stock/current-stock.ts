import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Api } from '../../../../api/api';
import { productGetall } from '../../../../api/functions';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { InventoryKpi } from '../inventory-kpi/inventory-kpi';
import { InventoryTable } from '../inventory-table/inventory-table';

@Component({
  selector: 'app-current-stock',
  standalone: true,
  imports: [
    ChartModule,
    ProgressBarModule,
    InventoryKpi,
    InventoryTable
  ],
  templateUrl: './current-stock.html',
  styleUrl: './current-stock.css',
})
export class CurrentStock implements OnInit {
  private readonly api = inject(Api);

  productos = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  agotados = computed(() =>
    this.productos().filter(p => Number(p.totalStock) === 0)
  );

  criticos = computed(() =>
    this.productos().filter(p => Number(p.totalStock) > 0 && Number(p.totalStock) <= Number(p.stockMinimum))
  );

  enAlerta = computed(() =>
    this.productos().filter(p => Number(p.totalStock) <= Number(p.stockMinimum))
  );

  totalProductos = computed(() => this.productos().length);

  saludInventario = computed(() => {
    const total = this.totalProductos();
    if (total === 0) return 0;
    return Math.round(((total - this.enAlerta().length) / total) * 100);
  });

  chartData = computed(() => {
    return this.enAlerta()
      .slice(0, 10)
      .map(p => ({
        name: p.name,
        stockActual: Number(p.totalStock),
        stockMinimo: Number(p.stockMinimum)
      }));
  });

  top5Criticos = computed(() => {
    return this.enAlerta()
      .sort((a, b) => Number(a.totalStock) - Number(b.totalStock))
      .slice(0, 5)
      .map(p => ({
        ...p,
        porcentaje: Math.round((Number(p.totalStock) / Number(p.stockMinimum)) * 100)
      }));
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  busquedaTabla = signal<string>('');

  filtradosAlerta = computed(() => {
    const q = this.busquedaTabla().toLowerCase().trim();
    if (!q) return this.enAlerta();
    return this.enAlerta().filter(p => p.name?.toLowerCase().includes(q));
  });

  barChartData = computed(() => ({
    labels: this.chartData().map(p => p.name),
    datasets: [
      {
        label: 'Stock actual',
        data: this.chartData().map(p => p.stockActual),
        backgroundColor: '#f97316',
      },
      {
        label: 'Stock mínimo',
        data: this.chartData().map(p => p.stockMinimo),
        backgroundColor: '#fde68a',
      }
    ]
  }));

  barChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  onBusqueda(event: Event): void {
    this.busquedaTabla.set((event.target as HTMLInputElement).value);
  }

  onVerLotes(product: any): void {
  }

  onRegistrarIngreso(product: any): void {
  }
  protected readonly Number = Number;
  private loadProducts(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.invoke$Response(productGetall).then((raw: any) => {
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type !== 'success') {
        this.error.set(data.listMessage[0] ?? 'Error al cargar productos.');
        return;
      }

      this.productos.set(data.listProducts ?? []);

    }).catch(() => {
      this.error.set('Error al cargar productos.');
    }).finally(() => {
      this.loading.set(false);
    });
  }
}