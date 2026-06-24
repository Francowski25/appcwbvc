import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Api } from '../../../../api/api';
import { LotKpi } from '../lot-kpi/lot-kpi';
import { LotSidebar } from '../lot-sidebar/lot-sidebar';
import { LotTable } from '../lot-table/lot-table';
import { LotStock } from '../ui/lot-stock/lot-stock';
import { LotStatus } from '../ui/lot-status/lot-status';
import { lotGetall } from '../../../../api/functions';

@Component({
  selector: 'app-lots',
  imports: [
    LotKpi,
    LotSidebar,
    LotTable,
    LotStock,
    LotStatus
  ],
  templateUrl: './lot-getall.html',
})
export class LotGetall implements OnInit {
  private readonly api = inject(Api);

  lotes = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  busqueda = signal<string>('');
  proveedorSeleccionado = signal<string>('');
  estadoSeleccionado = signal<string>('');

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

  onBusqueda(value: string): void {
    this.busqueda.set(value);
  }

  onProveedorChange(name: string): void {
    this.proveedorSeleccionado.set(name);
  }

  onEstadoChange(name: string): void {
    this.estadoSeleccionado.set(name);
  }

  onLimpiarFiltros(): void {
    this.busqueda.set('');
    this.proveedorSeleccionado.set('');
    this.estadoSeleccionado.set('');
  }
}