import { Component, inject, OnInit, signal, computed, viewChild } from '@angular/core';
import { Api } from '../../../../api/api';
import { laboratoryGetall, laboratoryStatus, productGetall } from '../../../../api/functions';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { LaboratorySidebar } from '../laboratory-sidebar/laboratory-sidebar';
import { LaboratoryTable } from '../laboratory-table/laboratory-table';
import { LaboratoryGraphic } from '../ui/laboratory-graphic/laboratory-graphic';
import { LaboratoryInsert } from '../laboratory-insert/laboratory-insert';
import { LaboratoryDetail } from '../laboratory-detail/laboratory-detail';

@Component({
  selector: 'app-laboratory-getall',
  standalone: true,
  imports: [
    LaboratorySidebar,
    LaboratoryTable,
    LaboratoryGraphic,
    LaboratoryInsert,
    LaboratoryDetail,
    ConfirmDialogModule,
    DialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './laboratory-getall.html',
  styleUrl: './laboratory-getall.css'
})
export class LaboratoryGetall implements OnInit {
  private readonly api = inject(Api);
  private readonly messageService = inject(MessageService);

  laboratoryInsertComp = viewChild(LaboratoryInsert);

  laboratories = signal<any[]>([]);
  products = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  busqueda = signal<string>('');
  estadoFiltro = signal<string>('');

  showInsertDialog = signal<boolean>(false);
  showDetailDialog = signal<boolean>(false);
  selectedLaboratory = signal<any>(null);

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
    ])
      .then(([resLab, resProd]: any[]) => {
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
      })
      .catch(() => {
        this.error.set('Error al cargar los datos del servidor.');
      })
      .finally(() => {
        this.loading.set(false);
      });
  }

  onBusquedaChange(valor: string): void { this.busqueda.set(valor); }
  onEstadoChange(valor: string): void { this.estadoFiltro.set(valor); }

  onCrearLaboratorio(): void {
    this.showInsertDialog.set(true);
  }

  onLaboratorioRegistrado(): void {
    this.showInsertDialog.set(false);
    this.initialization();
  }

  onEditar(laboratorio: any): void {
    this.selectedLaboratory.set(laboratorio);
    this.showDetailDialog.set(true);
  }

  onLaboratorioDetallado(): void {
    this.showDetailDialog.set(false);
    this.selectedLaboratory.set(null);
  }

  onToggleStatus(laboratorio: any): void {
    const nuevoEstado = laboratorio.status?.toLowerCase() === 'activo' ? 'inactivo' : 'activo';

    this.api.invoke$Response(laboratoryStatus, { id: laboratorio.idLaboratory, newStatus: nuevoEstado })
      .then((raw: any) => {
        const res = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;

        if (res.type === 'success') {
          laboratorio.status = nuevoEstado;
          this.laboratories.set([...this.laboratories()]);

          this.messageService.add({
            severity: 'success',
            summary: 'Estado actualizado',
            detail: res.listMessage?.[0] || `Laboratorio ${nuevoEstado}.`,
            life: 4000
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: res.listMessage?.[0] || 'No se pudo cambiar el estado.',
            life: 4000
          });
        }
      })
      .catch(() => {
        this.messageService.add({
          severity: 'error',
          summary: 'Sin conexión',
          detail: 'El servidor no respondió al intentar cambiar el estado.',
          life: 4000
        });
      });
  }
}