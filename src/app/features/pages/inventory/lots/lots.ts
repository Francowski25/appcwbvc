import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Api } from '../../../../api/api';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { lotGetall } from '../../../../api/functions';

interface FiltroContador {
  name: string;
  count: number;
}

@Component({
  selector: 'app-lots',
  imports: [
    ChartModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    TagModule,
  ],
  templateUrl: './lots.html',
})
export class Lots implements OnInit {
  private readonly api = inject(Api);

  lotes = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  busqueda = signal<string>('');
  proveedorSeleccionado = signal<string>('');
  estadoSeleccionado = signal<string>('');

  // --- Filtros laterales ---
  proveedores = computed<FiltroContador[]>(() => {
    return this.lotes().reduce((acc: FiltroContador[], l: any) => {
      const nombre = l.supplierName || 'Sin proveedor';
      const existing = acc.find(p => p.name === nombre);
      existing ? existing.count++ : acc.push({ name: nombre, count: 1 });
      return acc;
    }, []);
  });

  estados = computed<FiltroContador[]>(() => {
    return this.lotes().reduce((acc: FiltroContador[], l: any) => {
      const estado = l.expirationStatus || 'Sin fecha';
      const existing = acc.find(e => e.name === estado);
      existing ? existing.count++ : acc.push({ name: estado, count: 1 });
      return acc;
    }, []);
  });

  // --- Filtrado combinado ---
  filtrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const prov = this.proveedorSeleccionado();
    const estado = this.estadoSeleccionado();

    let lista = this.lotes();

    if (prov) lista = lista.filter((l: any) => l.supplierName === prov);
    if (estado) lista = lista.filter((l: any) => l.expirationStatus === estado);
    if (q) {
      lista = lista.filter((l: any) =>
        l.code?.toLowerCase().includes(q) ||
        l.productName?.toLowerCase().includes(q)
      );
    }

    return lista;
  });

  // --- KPIs ---
  totalLotes = computed(() => this.lotes().length);

  porVencer = computed(() =>
    this.lotes().filter(l => l.expirationStatus === 'Por vencer').length
  );

  agotados = computed(() =>
    this.lotes().filter(l => Number(l.currentStock) === 0).length
  );

  valorAlmacen = computed(() =>
    this.lotes().reduce((acc, l) =>
      acc + (Number(l.currentStock) * Number(l.purchasePrice)), 0)
  );

  // --- Gráficas ---
  barChartData = computed(() => {
    const top10 = [...this.lotes()]
      .sort((a, b) => Number(b.currentStock) - Number(a.currentStock))
      .slice(0, 10);

    return {
      labels: top10.map(l => l.code),
      datasets: [{
        label: 'Stock actual',
        data: top10.map(l => Number(l.currentStock)),
        backgroundColor: '#ec4899',
        borderRadius: 6,
      }]
    };
  });

  barChartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true }
    }
  };

  donutChartData = computed(() => {
    const vigentes = this.lotes().filter(l => l.expirationStatus === 'Vigente').length;
    const porVencerCount = this.porVencer();
    const vencidos = this.lotes().filter(l => l.expirationStatus === 'Vencido').length;

    return {
      labels: ['Vigente', 'Por vencer', 'Vencido'],
      datasets: [{
        data: [vigentes, porVencerCount, vencidos],
        backgroundColor: ['#22c55e', '#f97316', '#ef4444'],
        hoverOffset: 8,
      }]
    };
  });

  donutChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  ngOnInit(): void {
    this.loadLotes();
  }

  private loadLotes(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.invoke$Response(lotGetall).then((raw: any) => {
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;

      if (data.type !== 'success') {
        this.error.set(data.listMessage[0] ?? 'Error al cargar lotes.');
        return;
      }

      this.lotes.set(data.listLots ?? []);

    }).catch(() => {
      this.error.set('Error al cargar lotes.');
    }).finally(() => {
      this.loading.set(false);
    });
  }

  onBusqueda(event: Event): void {
    this.busqueda.set((event.target as HTMLInputElement).value);
  }

  onProveedorChange(name: string): void {
    this.proveedorSeleccionado.set(this.proveedorSeleccionado() === name ? '' : name);
  }

  onEstadoChange(name: string): void {
    this.estadoSeleccionado.set(this.estadoSeleccionado() === name ? '' : name);
  }

  onLimpiarFiltros(): void {
    this.busqueda.set('');
    this.proveedorSeleccionado.set('');
    this.estadoSeleccionado.set('');
  }

  getBadgeEstado(estado: string): { bg: string; text: string; dot: string } {
    switch (estado) {
      case 'Vigente': return { bg: 'bg-green-50 border-green-200', text: 'text-green-600', dot: 'bg-green-500' };
      case 'Por vencer': return { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-600', dot: 'bg-orange-400' };
      case 'Vencido': return { bg: 'bg-red-50 border-red-200', text: 'text-red-600', dot: 'bg-red-500' };
      default: return { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-500', dot: 'bg-gray-400' };
    }
  }

  protected readonly Number = Number;
}