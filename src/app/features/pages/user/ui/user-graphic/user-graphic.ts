import { ChangeDetectionStrategy, Component, OnInit, signal, computed, input } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { ChartData, ChartOptions } from 'chart.js';

interface UsuarioRol {
  name: string;
  activos: number;
  inactivos: number;
}

@Component({
  selector: 'app-user-graphic',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './user-graphic.html',
  styleUrl: './user-graphic.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserGraphic implements OnInit {

  // ✅ recibe los usuarios desde el padre (users-getall)
  usuarios = input<any[]>([]);

  // ✅ computed deriva los datos desde el input — reactivo con OnPush
  chartData = computed<ChartData>(() => {
    const list = this.usuarios();

    const roles = ['administrador', 'quimico', 'vendedor'];
    const labels = ['Administrador', 'Químico', 'Vendedor'];

    const activos = roles.map(r => list.filter((u: any) => u.role?.toLowerCase() === r && u.status?.toLowerCase() === 'activo').length);
    const inactivos = roles.map(r => list.filter((u: any) => u.role?.toLowerCase() === r && u.status?.toLowerCase() !== 'activo').length);

    return {
      labels,
      datasets: [
        {
          label: 'Activos',
          backgroundColor: '#ec4899',
          hoverBackgroundColor: '#db2777',
          borderRadius: 6,
          data: activos
        },
        {
          label: 'Inactivos',
          backgroundColor: '#cbd5e1',
          hoverBackgroundColor: '#94a3b8',
          borderRadius: 6,
          data: inactivos
        }
      ]
    };
  });

  chartOptions = signal<ChartOptions>({
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#475569',
          boxWidth: 12,
          usePointStyle: true,
          font: { size: 11, weight: 'bold' }
        }
      },
      tooltip: {
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} usuarios`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          stepSize: 1          // ✅ enteros — no tiene sentido 1.5 usuarios
        },
        grid: { color: '#f1f5f9' }
      }
    }
  });

  ngOnInit(): void { }  // ✅ queda vacío — computed ya es reactivo
}