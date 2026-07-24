import { Component, inject, OnInit, signal, computed, viewChild } from '@angular/core';
import { Api } from '../../../../api/api';
import { categoryGetall, categoryStatus, productGetall } from '../../../../api/functions';
import { CategorySidebar } from '../category-sidebar/category-sidebar';
import { CategoryTable } from '../category-table/category-table';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { CategoryGraphic } from '../ui/category-graphic/category-graphic';
import { CategoryInsert } from '../category-insert/category-insert';
import { CategoryDetail } from '../category-detail/category-detail';

@Component({
  selector: 'app-category-getall',
  standalone: true,
  imports: [
    CategorySidebar,
    CategoryTable,
    CategoryGraphic,
    CategoryInsert,
    ConfirmDialogModule,
    DialogModule,
    CategoryDetail
  ],
  providers: [ConfirmationService],
  templateUrl: './category-getall.html',
  styleUrl: './category-getall.css'
})
export class CategoryGetall implements OnInit {
  private readonly api = inject(Api);
  private readonly messageService = inject(MessageService);

  categoryInsertComp = viewChild(CategoryInsert);

  categorias = signal<any[]>([]);
  productos = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  busqueda = signal<string>('');
  estadoFiltro = signal<string>('');

  showInsertDialog = signal<boolean>(false);
  showDetailDialog = signal<boolean>(false);
  selectedCategory = signal<any>(null);

  filtrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const estado = this.estadoFiltro().toLowerCase();
    let lista = this.categorias();

    if (q) lista = lista.filter((c: any) => c.name?.toLowerCase().includes(q));
    if (estado) lista = lista.filter((c: any) => c.status?.toLowerCase() === estado);

    return lista;
  });

  totalCategorias = computed(() => this.categorias().length);
  totalActivas = computed(() => this.categorias().filter((c: any) => c.status?.toLowerCase() === 'activo').length);
  totalInactivas = computed(() => this.categorias().filter((c: any) => c.status?.toLowerCase() !== 'activo').length);

  ngOnInit(): void {
    this.initialization();
  }

  private initialization(): void {
    this.loading.set(true);
    this.error.set('');

    Promise.all([
      this.api.invoke$Response(categoryGetall),
      this.api.invoke$Response(productGetall)
    ])
      .then(([resCat, resProd]: any[]) => {
        const dataCat = typeof resCat.body === 'string' ? JSON.parse(resCat.body) : resCat.body;
        if (dataCat.type === 'success') {
          this.categorias.set(dataCat.listCategories ?? []);
        } else {
          this.error.set(dataCat.listMessage?.[0] ?? 'Error al cargar categorías.');
        }

        const dataProd = typeof resProd.body === 'string' ? JSON.parse(resProd.body) : resProd.body;
        if (dataProd.type === 'success') {
          this.productos.set(dataProd.listProducts ?? []);
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

  onCrearCategoria(): void {
    this.showInsertDialog.set(true);
  }

  onCategoriaRegistrada(): void {
    this.showInsertDialog.set(false);
    this.initialization();
  }

  onEditar(categoria: any): void {
    this.selectedCategory.set(categoria);
    this.showDetailDialog.set(true);
  }

  onCategoriaDetallada(): void {
    this.showDetailDialog.set(false);
    this.selectedCategory.set(null);
  }

  onToggleStatus(categoria: any): void {
    const nuevoEstado = categoria.status?.toLowerCase() === 'activo' ? 'inactivo' : 'activo';

    this.api.invoke$Response(categoryStatus, { id: categoria.idCategory, newStatus: nuevoEstado })
      .then((raw: any) => {
        const res = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;

        if (res.type === 'success') {
          categoria.status = nuevoEstado;
          this.categorias.set([...this.categorias()]);

          this.messageService.add({
            severity: 'success',
            summary: 'Estado actualizado',
            detail: res.listMessage?.[0] || `Categoría ${nuevoEstado}.`,
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