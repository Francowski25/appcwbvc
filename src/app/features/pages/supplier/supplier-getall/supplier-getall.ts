import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Api } from '../../../../api/api';
import { supplierGetall, supplierStatus, SupplierStatus$Params } from '../../../../api/functions';
import { SupplierKpi } from '../supplier-kpi/supplier-kpi';
import { SupplierSidebar } from '../supplier-sidebar/supplier-sidebar';
import { SupplierTable } from '../supplier-table/supplier-table';
import { SupplierNew } from '../supplier-new/supplier-new';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-supplier-getall',
  standalone: true,
  imports: [
    SupplierKpi,
    SupplierSidebar,
    SupplierTable,
    SupplierNew
  ],
  templateUrl: './supplier-getall.html',
  styleUrl: './supplier-getall.css',
})
export class SupplierGetall implements OnInit {
  private readonly api = inject(Api);
  private readonly messageService = inject(MessageService);

  proveedores = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  busqueda = signal<string>('');
  estadoSeleccionado = signal<string>('');

  proveedorSeleccionado = signal<any>(null);
  showForm = signal<boolean>(false);

  // --- Filtrados ---
  filtrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const estado = this.estadoSeleccionado();
    let lista = this.proveedores();
    if (estado) lista = lista.filter(p => p.status === estado);
    if (q) lista = lista.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.ruc?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    );
    return lista;
  });

  // --- KPIs ---
  totalProveedores = computed(() => this.proveedores().length);
  activos = computed(() => this.proveedores().filter(p => p.status === 'activo').length);
  inactivos = computed(() => this.proveedores().filter(p => p.status === 'inactivo').length);
  conRuc = computed(() => this.proveedores().filter(p => p.ruc && p.ruc !== '').length);

  ngOnInit(): void {
    this.loadProveedores();
  }

  private loadProveedores(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.invoke$Response(supplierGetall).then((raw: any) => {
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type !== 'success') {
        this.error.set(data.listMessage[0] ?? 'Error al cargar proveedores.');
        return;
      }
      this.proveedores.set(data.listSuppliers ?? []);
    }).catch(() => {
      this.error.set('Error al cargar proveedores.');
    }).finally(() => {
      this.loading.set(false);
    });
  }

  onBusqueda(value: string): void { this.busqueda.set(value); }
  onEstadoChange(value: string): void { this.estadoSeleccionado.set(value); }
  onLimpiarFiltros(): void { this.busqueda.set(''); this.estadoSeleccionado.set(''); }

  onNuevo(): void {
    this.proveedorSeleccionado.set(null);
    this.showForm.set(true);
  }

  onEditar(proveedor: any): void {
    this.proveedorSeleccionado.set(proveedor);
    this.showForm.set(true);
  }

  onToggleStatus(proveedor: any): void {
    const nuevoEstado = proveedor.status === 'activo' ? 'inactivo' : 'activo';

    const payload: SupplierStatus$Params = {
      id: proveedor.idSupplier,
      newStatus: nuevoEstado
    };

    this.api.invoke$Response(supplierStatus, payload).then((raw: any) => {
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type !== 'success') {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: data.listMessage?.[0] ?? 'No se pudo cambiar el estado.' });
        return;
      }
      proveedor.status = nuevoEstado;
      this.proveedores.set([...this.proveedores()]);
    }).catch(() => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cambiar estado.' });
    });
  }

  onGuardado(): void {
    this.showForm.set(false);
    this.loadProveedores();
  }
}