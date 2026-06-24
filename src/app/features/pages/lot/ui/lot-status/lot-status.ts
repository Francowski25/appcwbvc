import { Component, input, computed } from '@angular/core';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-lot-status',
  imports: [ChartModule],
  templateUrl: './lot-status.html',
  styleUrl: './lot-status.css',
})
export class LotStatus {
  lotes = input.required<any[]>();
  porVencer = input.required<number>();

  vigentes = computed(() =>
    this.lotes().filter(l => l.expirationStatus === 'Vigente').length
  );

  vencidos = computed(() =>
    this.lotes().filter(l => l.expirationStatus === 'Vencido').length
  );

  chartData = computed(() => ({
    labels: ['Vigente', 'Por vencer', 'Vencido'],
    datasets: [{
      data: [this.vigentes(), this.porVencer(), this.vencidos()],
      backgroundColor: ['#22c55e', '#f97316', '#ef4444'],
      hoverOffset: 8,
    }]
  }));

  chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const }
    }
  }));
}