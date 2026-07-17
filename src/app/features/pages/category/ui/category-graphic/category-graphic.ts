import { Component, computed, input, signal } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-category-graphic',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './category-graphic.html',
  styleUrl: './category-graphic.scss',
})
export class CategoryGraphic {

  categorias = input<any[]>([]);
  productos = input<any[]>([]);

  chartData = computed<ChartData>(() => {
    const listaCategorias = this.categorias();

    if (!listaCategorias.length) {
      return { labels: [], datasets: [] };
    }

    const labels = listaCategorias.map(cat => cat.name ?? 'Sin nombre');
    const dataCantidad = listaCategorias.map(cat => Number(cat.totalProducts ?? 0));

    return {
      labels,
      datasets: [
        {
          label: 'Cantidad de Productos',
          data: dataCantidad,
          backgroundColor: 'rgba(236, 72, 153, 0.85)',
          hoverBackgroundColor: 'rgba(236, 72, 153, 1)',
          borderColor: 'transparent',
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    };
  });
  chartOptions = signal<ChartOptions<'bar'>>({
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#64748b',
          font: { size: 12, weight: 500 },
          usePointStyle: true,
          pointStyleWidth: 8,
          boxHeight: 8,
          padding: 16,
        }
      },
      tooltip: {
        padding: 14,
        cornerRadius: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(236, 72, 153, 0.4)',
        borderWidth: 1,
        displayColors: true,
        boxWidth: 10,
        boxHeight: 10,
        boxPadding: 4,
        callbacks: {
          title: (items) => `${items[0].label}`,
          label: (ctx) => `  Productos: ${ctx.parsed.y}`,
          afterLabel: (ctx) => {
            const y = ctx.parsed.y;
            if (y == null) return '';
            const total = this.categorias().reduce((a, cat) => a + Number(cat.totalProducts ?? 0), 0);
            if (total === 0) return '';
            const pct = ((y / total) * 100).toFixed(1);
            return `  Del total: ${pct}%`;
          },
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { display: false },
        border: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#94a3b8', font: { size: 11 }, stepSize: 1, precision: 0 },
        grid: { color: '#f1f5f9' },
        border: { display: false }
      }
    }
  });

}