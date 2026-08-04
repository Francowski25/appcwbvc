import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Api } from '../../../../api/api';
import { LotKpi } from '../lot-kpi/lot-kpi';
import { LotSidebar, Proveedor, EstadoLote } from '../lot-sidebar/lot-sidebar';
import { LotTable } from '../lot-table/lot-table';
import { LotStock } from '../ui/lot-stock/lot-stock';
import { LotStatus } from '../ui/lot-status/lot-status';
import { lotGetall } from '../../../../api/functions';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-lots',
  standalone: true,
  imports: [
    LotKpi,
    LotSidebar,
    LotTable,
    LotStock,
    LotStatus,
    DecimalPipe
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

  proveedores = computed<Proveedor[]>(() => {
    return this.lotes().reduce((acc: Proveedor[], l: any) => {
      const nombre = l.supplierName || 'Sin proveedor';
      const item = acc.find(p => p.name.toLowerCase() === nombre.toLowerCase());
      if (item) {
        item.count++;
      } else {
        acc.push({ name: nombre, count: 1 });
      }
      return acc;
    }, []);
  });

  estados = computed<EstadoLote[]>(() => {
    return this.lotes().reduce((acc: EstadoLote[], l: any) => {
      const estado = l.expirationStatus || 'Sin estado';
      const item = acc.find(e => e.name.toLowerCase() === estado.toLowerCase());
      if (item) {
        item.count++;
      } else {
        acc.push({ name: estado, count: 1 });
      }
      return acc;
    }, []);
  });

  filtrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const prov = this.proveedorSeleccionado().toLowerCase().trim();
    const estado = this.estadoSeleccionado().toLowerCase().trim();

    let lista = this.lotes();

    if (prov) {
      lista = lista.filter((l: any) => l.supplierName?.toLowerCase().includes(prov));
    }
    if (estado) {
      lista = lista.filter((l: any) => l.expirationStatus?.toLowerCase().includes(estado));
    }
    if (q) {
      lista = lista.filter((l: any) =>
        l.code?.toLowerCase().includes(q) ||
        l.productName?.toLowerCase().includes(q) ||
        l.lotNumber?.toLowerCase().includes(q)
      );
    }

    return lista;
  });

  totalLotes = computed(() => this.lotes().length);

  optimos = computed(() =>
    this.lotes().filter(l => l.expirationStatus === 'Vigente' || l.expirationStatus === 'Óptimo').length
  );

  porVencer = computed(() =>
    this.lotes().filter(l => l.expirationStatus === 'Por vencer').length
  );

  vencidos = computed(() =>
    this.lotes().filter(l => l.expirationStatus === 'Vencido').length
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
}