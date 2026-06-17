import { ChangeDetectionStrategy, Component, signal, computed, input } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ChartData, ChartOptions } from 'chart.js';
import { NgClass } from '@angular/common';

type Periodo = 'dia' | 'semana' | 'mes' | 'anio';

interface OpcionPeriodo {
  label: string;
  value: Periodo;
}

@Component({
  selector: 'app-product-growth',
  standalone: true,
  imports: [ChartModule, NgClass],
  templateUrl: './product-growth.html',
  styleUrl: './product-growth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGrowth {

  productos = input<any[]>([]);
  periodo = signal<Periodo>('mes');

  totalRegistrados = computed(() => this.productos().length);

  readonly opcionesPeriodo: OpcionPeriodo[] = [
    { label: 'Días', value: 'dia' },
    { label: 'Semana', value: 'semana' },
    { label: 'Meses', value: 'mes' },
    { label: 'Año', value: 'anio' },
  ];

  onPeriodoChange(valor: Periodo): void {
    this.periodo.set(valor);
  }

  private getVentanaInicio(periodo: Periodo): Date {
    const hoy = new Date();
    switch (periodo) {
      case 'dia': return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 13);
      case 'semana': return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 7 * 7);
      case 'mes': return new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1);
      case 'anio': return new Date(hoy.getFullYear() - 2, 0, 1);
    }
  }

  private toKey(fecha: Date, periodo: Periodo): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');

    switch (periodo) {
      case 'dia': return `${y}-${m}-${d}`;
      case 'semana': {
        const lunes = new Date(fecha);
        const dia = lunes.getDay();
        lunes.setDate(lunes.getDate() - dia + (dia === 0 ? -6 : 1));
        return `${lunes.getFullYear()}-${String(lunes.getMonth() + 1).padStart(2, '0')}-${String(lunes.getDate()).padStart(2, '0')}`;
      }
      case 'mes': return `${y}-${m}`;
      case 'anio': return `${y}`;
    }
  }

  private toLabel(key: string, periodo: Periodo): string {
    switch (periodo) {
      case 'dia':
        return new Date(key + 'T00:00:00')
          .toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
      case 'semana':
        return `Sem. ${new Date(key + 'T00:00:00')
          .toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}`;
      case 'mes': {
        const [y, m] = key.split('-');
        return new Date(Number(y), Number(m) - 1)
          .toLocaleDateString('es-PE', { month: 'short', year: 'numeric' });
      }
      case 'anio': return key;
    }
  }

  private generarRango(inicio: Date, periodo: Periodo): string[] {
    const claves: string[] = [];
    const hoy = new Date();
    const cursor = new Date(inicio);

    while (cursor <= hoy) {
      claves.push(this.toKey(cursor, periodo));
      switch (periodo) {
        case 'dia': cursor.setDate(cursor.getDate() + 1); break;
        case 'semana': cursor.setDate(cursor.getDate() + 7); break;
        case 'mes': cursor.setMonth(cursor.getMonth() + 1); break;
        case 'anio': cursor.setFullYear(cursor.getFullYear() + 1); break;
      }
    }

    return [...new Set(claves)];
  }

  private agrupadosPorPeriodo = computed(() => {
    const periodo = this.periodo();
    const inicio = this.getVentanaInicio(periodo);
    const rango = this.generarRango(inicio, periodo);

    const mapa = new Map<string, number>(rango.map(k => [k, 0]));

    for (const p of this.productos()) {
      if (!p.createdAt) continue;
      const fecha = new Date(p.createdAt.replace(' ', 'T'));
      if (fecha < inicio) continue;
      const key = this.toKey(fecha, periodo);
      if (mapa.has(key)) mapa.set(key, mapa.get(key)! + 1);
    }

    return mapa;
  });

  chartData = computed<ChartData>(() => {
    const nuevos = this.agrupadosPorPeriodo();
    const labels = [...nuevos.keys()].map(k => this.toLabel(k, this.periodo()));

    let acum = 0;
    const dataAcumulado = [...nuevos.values()].map(v => (acum += v));

    return {
      labels,
      datasets: [
        {
          label: 'Total acumulado',
          data: dataAcumulado,
          borderColor: '#ec4899',
          backgroundColor: 'rgba(236, 72, 153, 0.08)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#ec4899',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        }
      ]
    };
  });

  chartOptions = signal<ChartOptions>({
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} productos en total`
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