import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Api } from '../../../../api/api';
import { laboratoryGetall, productGetall } from '../../../../api/functions';
import { MessageService } from 'primeng/api';
import { LaboratorySidebar } from '../laboratory-sidebar/laboratory-sidebar';
import { LaboratoryTable } from '../laboratory-table/laboratory-table';
import { LaboratoryGraphic } from '../ui/laboratory-graphic/laboratory-graphic';
import { LaboratoryInsert } from '../laboratory-insert/laboratory-insert';

@Component({
  selector: 'app-laboratory-getall',
  standalone: true,
  imports: [
    LaboratorySidebar,
    LaboratoryTable,
    LaboratoryGraphic,
    LaboratoryInsert
  ],
  templateUrl: './laboratory-getall.html',
  styleUrl: './laboratory-getall.css'
})
export class LaboratoryGetall implements OnInit {
  private readonly api = inject(Api);
  private readonly messageService = inject(MessageService);

  laboratories = signal<any[]>([]);
  products = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');
  busqueda = signal<string>('');
  estadoFiltro = signal<string>('');
  showInsertDialog = signal<boolean>(false);

  filtrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const estado = this.estadoFiltro().toLowerCase();
    let lista = this.laboratories();

    if (q) lista = lista.filter((l: any) => l.name?.toLowerCase().includes(q));
    if (estado) lista = lista.filter((l: any) => l.status?.toLowerCase() === estado);

    return lista;
  });

  totalLaboratories = computed(() => this.laboratories().length);
  totalActivas = computed(() => this.laboratories().filter((l: any) => l.status?.toLowerCase() === 'activo').length);
  totalInactivas = computed(() => this.laboratories().filter((l: any) => l.status?.toLowerCase() !== 'activo').length);

  ngOnInit(): void {
    this.initialization();
  }

  private initialization(): void {
    this.loading.set(true);
    this.error.set('');

    Promise.all([
      this.api.invoke$Response(laboratoryGetall),
      this.api.invoke$Response(productGetall)
    ]).then(([resLab, resProd]: any[]) => {

      const dataLab = typeof resLab.body === 'string' ? JSON.parse(resLab.body) : resLab.body;
      if (dataLab.type === 'success') {
        this.laboratories.set(dataLab.listLaboratories ?? []);
      } else {
        this.error.set(dataLab.listMessage?.[0] ?? 'Error al cargar laboratorios.');
      }

      const dataProd = typeof resProd.body === 'string' ? JSON.parse(resProd.body) : resProd.body;
      if (dataProd.type === 'success') {
        this.products.set(dataProd.listProducts ?? []);
      }

    }).catch(() => {
      this.error.set('Error al cargar los datos del servidor.');
    }).finally(() => {
      this.loading.set(false);
    });
  }


  onBusquedaChange(valor: string): void { this.busqueda.set(valor); }
  onEstadoChange(valor: string): void { this.estadoFiltro.set(valor); }
  onCrearLaboratorio(): void { this.showInsertDialog.set(true); }

  onLaboratorioRegistrado(): void {
    this.showInsertDialog.set(false);
    this.initialization();
  }

  onEditar(laboratorio: any): void { }

  onToggleStatus(laboratorio: any): void {
    const nuevoEstado = laboratorio.status?.toLowerCase() === 'activo' ? 'inactivo' : 'activo';
    laboratorio.status = nuevoEstado;
    this.laboratories.set([...this.laboratories()]);
    this.messageService.add({
      severity: nuevoEstado === 'activo' ? 'success' : 'warn',
      summary: 'Estado cambiado',
      detail: `Laboratorio ${nuevoEstado}.`,
      life: 3000
    });
  }
}