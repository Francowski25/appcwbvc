import { Component, input, computed } from '@angular/core';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-lot-stock',
  imports: [ChartModule],
  templateUrl: './lot-stock.html',
  styleUrl: './lot-stock.css',
})
export class LotStock {
  lotes = input.required<any[]>();

  top10 = computed(() =>
    [...this.lotes()]
      .sort((a, b) => Number(b.currentStock) - Number(a.currentStock))
      .slice(0, 10)
  );

  chartData = computed(() => ({
    labels: this.top10().map(l => l.code),
    datasets: [{
      label: 'Stock actual',
      data: this.top10().map(l => Number(l.currentStock)),
      backgroundColor: '#ec4899',
      borderRadius: 6,
    }]
  }));

  chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 50 } }
    }
  }));
}