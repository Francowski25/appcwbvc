import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Api } from '../../../../api/api';
import { customerGetall, saleGetall } from '../../../../api/functions';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-report-customers',
  imports: [ChartModule, TableModule, DecimalPipe],
  templateUrl: './report-customers.html',
})
export class ReportCustomers implements OnInit {
  private readonly api = inject(Api);

  loading = signal<boolean>(true);
  error = signal<string>('');

  clientes = signal<any[]>([]);
  ventas = signal<any[]>([]);

  // --- KPIs ---
  totalClientes = computed(() => this.clientes().length);

  conDni = computed(() => this.clientes().filter(c => c.documentType === 'DNI').length);
  conRuc = computed(() => this.clientes().filter(c => c.documentType === 'RUC').length);

  nuevosEsteMes = computed(() => {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    return this.clientes().filter(c => {
      if (!c.createdAt) return false;
      return new Date(c.createdAt) >= inicioMes;
    }).length;
  });

  // --- Clientes frecuentes (más compras) ---
  clientesFrecuentes = computed(() => {
    const conteo: Record<string, any> = {};
    this.ventas()
      .filter(v => v.customerName && v.customerName !== 'Sin cliente')
      .forEach(v => {
        const key = v.customerName;
        if (!conteo[key]) {
          conteo[key] = {
            customerName: v.customerName,
            customerDocument: v.customerDocument ?? '—',
            totalCompras: 0,
            totalGastado: 0,
          };
        }
        conteo[key].totalCompras++;
        conteo[key].totalGastado += Number(v.total ?? 0);
      });

    return Object.values(conteo)
      .sort((a, b) => b.totalCompras - a.totalCompras)
      .slice(0, 10);
  });

  // --- Gráfica dona: tipo de documento ---
  donaTipoDocData = computed(() => ({
    labels: ['DNI', 'RUC', 'Otros'],
    datasets: [{
      data: [
        this.conDni(),
        this.conRuc(),
        this.totalClientes() - this.conDni() - this.conRuc()
      ],
      backgroundColor: ['#ec4899', '#3b82f6', '#f97316'],
      hoverOffset: 8,
    }]
  }));

  donaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } }
  };

  // --- Gráfica barras: top clientes por gasto ---
  barClientesData = computed(() => {
    const top = this.clientesFrecuentes().slice(0, 6);
    return {
      labels: top.map(c => c.customerName),
      datasets: [{
        label: 'Total gastado (S/)',
        data: top.map(c => c.totalGastado),
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

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loading.set(true);
    try {
      const [r1, r2] = await Promise.all([
        this.api.invoke$Response(customerGetall),
        this.api.invoke$Response(saleGetall),
      ]);
      const d1 = this.parse(r1);
      const d2 = this.parse(r2);
      if (d1.type === 'success') this.clientes.set(d1.listCustomers ?? []);
      if (d2.type === 'success') this.ventas.set(d2.listSales ?? []);
    } catch {
      this.error.set('Error al cargar datos.');
    } finally {
      this.loading.set(false);
    }
  }

  private parse(raw: any): any {
    return typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
  }

  protected readonly Number = Number;
}