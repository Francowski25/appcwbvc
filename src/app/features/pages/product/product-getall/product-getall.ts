import { Component, OnInit, signal, computed, inject, ViewChild } from '@angular/core';
import { Api } from '../../../../api/api';
import { productGetall } from '../../../../api/functions';
import { ProductsTable } from '../products-table/products-table';
import { ProductSidebar } from '../product-sidebar/product-sidebar';
import { ProductDetails } from '../product-details/product-details';
import { Dialog } from "primeng/dialog";
import { ProductInsert } from "../product-insert/product-insert";
import { ProductKpi } from '../product-kpi/product-kpi';
import { ProductGrowth } from '../ui/product-growth/product-growth';
import { ProductCategory } from '../ui/product-category/product-category';

interface FiltroContador {
  name: string;
  count: number;
}

@Component({
  selector: 'app-product-getall',
  standalone: true,
  imports: [
    ProductsTable,
    ProductSidebar,
    ProductDetails,
    ProductKpi,
    Dialog,
    ProductInsert,
    ProductGrowth,
    ProductCategory
  ],
  templateUrl: './product-getall.html',
  styleUrl: './product-getall.css',
})
export class ProductGetall implements OnInit {
  private readonly api = inject(Api);

  @ViewChild('productInsertComp') productInsertComp!: ProductInsert;

  productos = signal<any[]>([]);
  categorias = signal<FiltroContador[]>([]);
  laboratorios = signal<FiltroContador[]>([]);

  categoriaSeleccionada = signal<string>('');
  laboratorioSeleccionado = signal<string>('');
  productoSeleccionado = signal<any>(null);

  loading = signal<boolean>(true);
  error = signal<string>('');
  busqueda = signal<string>('');

  showCreate = signal<boolean>(false);
  showDetails = signal<boolean>(false);

  filtrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const cat = this.categoriaSeleccionada();
    const lab = this.laboratorioSeleccionado();

    let lista = this.productos();

    if (cat) lista = lista.filter((p: any) => p.category === cat);
    if (lab) lista = lista.filter((p: any) => p.laboratory === lab);
    if (!q) return lista;

    return lista.filter((p: any) => p.name?.toLowerCase().includes(q));
  });

  totalProductosQty = computed(() => this.productos().length);

  productosAgotadosQty = computed(() =>
    this.productos().filter((p: any) => Number(p.totalStock ?? 0) <= 0).length
  );

  productosPorVencerQty = computed(() => {
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + 30);
    return this.productos().filter((p: any) => {
      if (!p.nextExpiration) return false;
      const fecha = new Date(p.nextExpiration);
      return fecha <= limite && fecha >= hoy;
    }).length;
  });

  valorInventarioMonto = computed(() =>
    this.productos().reduce((acc: number, p: any) =>
      acc + (Number(p.totalStock ?? 0) * Number(p.priceSale ?? 0)), 0)
  );

  ngOnInit(): void {
    this.initialization();
  }

  private initialization(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.invoke$Response(productGetall).then((raw: any) => {
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;

      if (data.type !== 'success') {
        this.error.set(data.listMessage[0] ?? 'Error al cargar productos.');
        return;
      }

      const listaProductos = data.listProducts ?? [];
      this.productos.set(listaProductos);
      this.categorias.set(this.buildCategorias(listaProductos));
      this.laboratorios.set(this.buildLaboratorios(listaProductos));

    }).catch(() => {
      this.error.set('Error al cargar productos.');
    }).finally(() => {
      this.loading.set(false);
    });
  }

  private buildCategorias(products: any[]): FiltroContador[] {
    return products.reduce((acc: FiltroContador[], p: any) => {
      const existing = acc.find(c => c.name === p.category);
      existing ? existing.count++ : acc.push({ name: p.category || 'Sin Categoría', count: 1 });
      return acc;
    }, []);
  }

  private buildLaboratorios(products: any[]): FiltroContador[] {
    return products.reduce((acc: FiltroContador[], p: any) => {
      const existing = acc.find(l => l.name === p.laboratory);
      existing ? existing.count++ : acc.push({ name: p.laboratory || 'Sin Laboratorio', count: 1 });
      return acc;
    }, []);
  }

  onSeleccionar(product: any): void {
    this.productoSeleccionado.set(product);
    this.showDetails.set(true);
  }

  onCategoriaChange(name: string): void {
    this.categoriaSeleccionada.set(name);
    this.productoSeleccionado.set(null);
  }

  onLaboratorioChange(name: string): void {
    this.laboratorioSeleccionado.set(name);
    this.productoSeleccionado.set(null);
  }

  onBusqueda(value: string): void {
    this.busqueda.set(value);
  }

  onCrearProducto(): void {
    this.showCreate.set(true);
  }

  onProductoRegistrado(): void {
    this.showCreate.set(false);
    this.initialization();
  }

  onEditarProducto(product: any): void { }

  onToggleStatusProducto(product: any): void {
    const nuevoEstado = product.status?.toLowerCase() === 'activo' ? 'inactivo' : 'activo';
    product.status = nuevoEstado;
    this.productos.set([...this.productos()]);
  }

  onExportarCSV(): void { }
}