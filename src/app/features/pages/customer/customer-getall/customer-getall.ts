import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Api } from '../../../../api/api';
import { customerGetall } from '../../../../api/functions';
import { CustomerKpi } from '../customer-kpi/customer-kpi';
import { CustomerSidebar } from '../customer-sidebar/customer-sidebar';
import { CustomerTable } from '../customer-table/customer-table';

@Component({
  selector: 'app-customer-getall',
  imports: [CustomerKpi, CustomerSidebar, CustomerTable],
  templateUrl: './customer-getall.html',
})
export class CustomerGetall implements OnInit {
  private readonly api = inject(Api);

  clientes = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  busqueda = signal<string>('');
  tipoDocSeleccionado = signal<string>('');

  filtrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const tipo = this.tipoDocSeleccionado();
    let lista = this.clientes();
    if (tipo) lista = lista.filter(c => c.documentType === tipo);
    if (q) lista = lista.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.documentNumber?.toLowerCase().includes(q)
    );
    return lista;
  });

  totalClientes = computed(() => this.clientes().length);

  tiposDoc = computed(() =>
    this.clientes().reduce((acc: any[], c: any) => {
      const tipo = c.documentType || 'Otro';
      const existing = acc.find(t => t.name === tipo);
      existing ? existing.count++ : acc.push({ name: tipo, count: 1 });
      return acc;
    }, [])
  );

  clientesHoy = computed(() => {
    const hoy = new Date().toDateString();
    return this.clientes().filter(c => {
      if (!c.createdAt) return false;
      return new Date(c.createdAt).toDateString() === hoy;
    }).length;
  });

  conDni = computed(() =>
    this.clientes().filter(c => c.documentType === 'DNI').length
  );

  conRuc = computed(() =>
    this.clientes().filter(c => c.documentType === 'RUC').length
  );

  ngOnInit(): void {
    this.loadClientes();
  }

  private async loadClientes(): Promise<void> {
    this.loading.set(true);
    try {
      const raw: any = await this.api.invoke$Response(customerGetall);
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type === 'success') this.clientes.set(data.listCustomers ?? []);
      else this.error.set(data.listMessage[0] ?? 'Error al cargar clientes.');
    } catch {
      this.error.set('Error al cargar clientes.');
    } finally {
      this.loading.set(false);
    }
  }

  onBusqueda(value: string): void { this.busqueda.set(value); }
  onTipoDocChange(value: string): void { this.tipoDocSeleccionado.set(value); }
  onLimpiarFiltros(): void {
    this.busqueda.set('');
    this.tipoDocSeleccionado.set('');
  }
}