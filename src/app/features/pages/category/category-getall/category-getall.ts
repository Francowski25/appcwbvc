import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../../../api/api';
import { categoryGetall, productGetall } from '../../../../api/functions';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CategorySidebar } from '../category-sidebar/category-sidebar';
import { CategoryTable } from '../category-table/category-table';
import { MessageService } from 'primeng/api';
import { CategoryGraphic } from '../ui/category-graphic/category-graphic';
import { CategoryInsert } from '../category-insert/category-insert';

@Component({
  selector: 'app-category-getall',
  imports: [
    CommonModule,
    DialogModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    CategorySidebar,
    CategoryTable,
    CategoryGraphic,
    CategoryInsert
  ],
  templateUrl: './category-getall.html',
  styleUrl: './category-getall.css'
})
export class CategoryGetall implements OnInit {
  private readonly api = inject(Api);
  private readonly messageService = inject(MessageService);

  categorias = signal<any[]>([]);
  productos = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');
  busqueda = signal<string>('');
  estadoFiltro = signal<string>('');
  showInsertDialog = signal<boolean>(false);

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

  getSeverity(status: string): 'success' | 'danger' {
    return status?.toLowerCase() === 'activo' ? 'success' : 'danger';
  }

  onBusquedaChange(valor: string): void { this.busqueda.set(valor); }
  onEstadoChange(valor: string): void { this.estadoFiltro.set(valor); }
  onCrearCategoria(): void { this.showInsertDialog.set(true); }

  onCategoriaRegistrada(): void {
    this.showInsertDialog.set(false);
    this.initialization();
  }

  onEditar(categoria: any): void { }

  onToggleStatus(categoria: any): void {
    const nuevoEstado = categoria.status?.toLowerCase() === 'activo' ? 'inactivo' : 'activo';
    categoria.status = nuevoEstado;
    this.categorias.set([...this.categorias()]);
    this.messageService.add({
      severity: nuevoEstado === 'activo' ? 'success' : 'warn',
      summary: 'Estado cambiado',
      detail: `Categoría ${nuevoEstado}.`,
      life: 3000
    });
  }

  onEliminar(idCategory: any): void { }
}