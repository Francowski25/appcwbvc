import { ChangeDetectionStrategy, Component, signal, computed, input } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-product-category',
  imports: [ChartModule],
  templateUrl: './product-category.html',
  styleUrl: './product-category.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCategory {

  productos = input<any[]>([]);

  private readonly COLORES = [
    '#ec4899',
    '#a78bfa',
    '#34d399',
    '#fb923c',
    '#60a5fa',
    '#f472b6',
    '#4ade80',
    '#facc15',
    '#818cf8',
    '#38bdf8',
  ];

  private porCategoria = computed(() => {
    const mapa = new Map<string, number>();
    for (const p of this.productos()) {
      const cat = p.category || 'Sin categoría';
      mapa.set(cat, (mapa.get(cat) ?? 0) + 1);
    }
    return new Map([...mapa.entries()].sort((a, b) => b[1] - a[1]));
  });

  totalCategorias = computed(() => this.porCategoria().size);

  chartData = computed<ChartData>(() => {
    const mapa = this.porCategoria();
    const labels = [...mapa.keys()];
    const data = [...mapa.values()];
    const colores = labels.map((_, i) => this.COLORES[i % this.COLORES.length]);

    return {
      labels,
      datasets: [
        {
          label: 'Productos',
          data,
          backgroundColor: colores,
          hoverBackgroundColor: colores.map(c => c + 'cc'),
          borderColor: '#fff',
          borderWidth: 3,
          hoverOffset: 8,
        }
      ]
    };
  });

  chartOptions = signal<ChartOptions<'doughnut'>>({
    maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#64748b',
          boxWidth: 10,
          padding: 16,
          usePointStyle: true,
          font: { size: 11, weight: 'bold' }
        }
      },
      tooltip: {
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (ctx) => {
            const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const valor = ctx.parsed;
            const pct = Math.round((valor / total) * 100);
            return ` ${ctx.label}: ${valor} productos (${pct}%)`;
          }
        }
      }
    }
  });
}