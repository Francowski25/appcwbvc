import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../../../../api/api';
import { purchaseGetall } from '../../../../api/functions';
import { PurchaseKpi } from '../purchase-kpi/purchase-kpi';
import { PurchaseSidebar } from '../purchase-sidebar/purchase-sidebar';
import { PurchaseTable } from '../purchase-table/purchase-table';
import { PurchaseDetail } from '../purchase-detail/purchase-detail';

@Component({
  selector: 'app-purchase-getall',
  imports: [PurchaseKpi, PurchaseSidebar, PurchaseTable, PurchaseDetail],
  templateUrl: './purchase-getall.html',
  styleUrl: './purchase-getall.css',
})
export class PurchaseGetall implements OnInit {
  private readonly api = inject(Api);
  private readonly router = inject(Router);

  compras = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  busqueda = signal<string>('');
  proveedorSeleccionado = signal<string>('');

  compraSeleccionada = signal<any>(null);
  showDetalle = signal<boolean>(false);

  filtrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const prov = this.proveedorSeleccionado();
    let lista = this.compras();
    if (prov) lista = lista.filter(c => c.supplierName === prov);
    if (q) lista = lista.filter(c =>
      c.supplierName?.toLowerCase().includes(q) ||
      c.userName?.toLowerCase().includes(q) ||
      c.observation?.toLowerCase().includes(q)
    );
    return lista;
  });

  totalCompras = computed(() => this.compras().length);

  montoTotal = computed(() =>
    this.compras().reduce((acc, c) => acc + Number(c.costoTotal ?? 0), 0)
  );

  proveedoresDistintos = computed(() =>
    new Set(this.compras().map(c => c.supplierName)).size
  );

  promedioPorCompra = computed(() => {
    const total = this.totalCompras();
    if (total === 0) return 0;
    return this.montoTotal() / total;
  });

  proveedores = computed(() => {
    return this.compras().reduce((acc: any[], c: any) => {
      const nombre = c.supplierName || 'Sin proveedor';
      const existing = acc.find(p => p.name === nombre);
      existing ? existing.count++ : acc.push({ name: nombre, count: 1 });
      return acc;
    }, []);
  });

  ngOnInit(): void {
    this.loadCompras();
  }

  private loadCompras(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.invoke$Response(purchaseGetall).then((raw: any) => {
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type !== 'success') {
        this.error.set(data.listMessage[0] ?? 'Error al cargar compras.');
        return;
      }
      this.compras.set(data.listPurchases ?? []);
    }).catch(() => {
      this.error.set('Error al cargar compras.');
    }).finally(() => {
      this.loading.set(false);
    });
  }

  onBusqueda(value: string): void { this.busqueda.set(value); }
  onProveedorChange(name: string): void { this.proveedorSeleccionado.set(name); }
  onLimpiarFiltros(): void { this.busqueda.set(''); this.proveedorSeleccionado.set(''); }

  onVerDetalle(compra: any): void {
    this.compraSeleccionada.set(compra);
    this.showDetalle.set(true);
  }

  onNuevaCompra(): void {
    this.router.navigate(['/admin/compras/nueva']);
  }
}