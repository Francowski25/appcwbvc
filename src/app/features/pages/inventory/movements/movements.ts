import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Api } from '../../../../api/api';
import {
  movementDetail,
  kardexProduct,
  productSearch,
  movementCreate,
  MovementCreate$Params,
  movementGetall
} from '../../../../api/functions';

import { MovementsSidebar } from './movements-sidebar/movements-sidebar';
import { MovementsTable } from './movements-table/movements-table';
import { InventoryDetail } from './inventory-detail/inventory-detail';
import { MovementsKpi } from "./movements-kpi/movements-kpi";
import { ProductKardex } from './product-kardex/product-kardex';
import { MovementsNew } from './movements-new/movements-new';

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [
    MovementsSidebar,
    MovementsTable,
    InventoryDetail,
    MovementsKpi,
    ProductKardex,
    DecimalPipe,
    MovementsNew
  ],
  templateUrl: './movements.html',
  styleUrl: './movements.css',
})
export class Movements implements OnInit {
  private readonly api = inject(Api);

  movimientos = signal<any[]>([]);
  loadingList = signal<boolean>(true);
  errorList = signal<string>('');

  busqueda = signal<string>('');
  tipoSeleccionado = signal<string>('');
  usuarioSeleccionado = signal<string>('');

  mostrarDialogo = signal<boolean>(false);
  idSeleccionado = signal<string | null>(null);
  detalleMovimiento = signal<any | null>(null);
  loadingDetail = signal<boolean>(false);
  errorDetail = signal<string>('');

  resultadosBusquedaProductos = signal<any[]>([]);
  buscandoProductos = signal<boolean>(false);

  idProductoSeleccionado = signal<string | null>(null);
  kardexProductoData = signal<any | null>(null);
  loadingKardex = signal<boolean>(false);
  errorKardex = signal<string>('');

  mostrarCrearMovimiento = signal<boolean>(false);
  guardandoMovimiento = signal<boolean>(false);

  totalMovimientosQty = computed(() => this.movimientos().length);

  totalCostoMonto = computed(() => {
    return this.movimientos().reduce((acc, m) => acc + Number(m.costoTotal ?? m.cost ?? m.monto ?? 0), 0);
  });

  ngOnInit(): void {
    this.initialization();
  }

  abrirModalCrearMovimiento(): void {
    this.mostrarCrearMovimiento.set(true);
  }

  private initialization(): void {
    this.loadingList.set(true);
    this.errorList.set('');

    this.api.invoke$Response(movementGetall).then((raw: any) => {
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;

      if (data.type !== 'success') {
        this.errorList.set(data.listMessage?.[0] ?? 'Error al cargar movimientos.');
        return;
      }

      const list = data.listMovements ?? [];
      this.movimientos.set(list);
    }).catch(() => {
      this.errorList.set('Error al conectar con el servidor.');
    }).finally(() => {
      this.loadingList.set(false);
    });
  }

  /**
   * Registro de un nuevo movimiento usando Api.invoke$Response
   */
  crearMovimientoBackend(paramsBody: MovementCreate$Params['body']): void {
    this.guardandoMovimiento.set(true);

    this.api.invoke$Response(movementCreate, { body: paramsBody }).then((raw: any) => {
      const res = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;

      if (res?.type === 'success' || raw.status === 200 || raw.status === 201) {
        this.mostrarCrearMovimiento.set(false);
      } else {
        alert(res?.listMessage?.[0] ?? 'No se pudo registrar el movimiento.');
      }
    }).catch((err) => {
      console.error('❌ Error al crear movimiento:', err);
      alert('Error al conectar con el servidor.');
    }).finally(() => {
      this.guardandoMovimiento.set(false);
    });
  }

  /**
   * Búsqueda de productos vía Api.invoke$Response
   */
  buscarProductosBackend(query: string): void {
    if (!query || query.trim().length === 0) {
      this.resultadosBusquedaProductos.set([]);
      return;
    }

    this.buscandoProductos.set(true);

    this.api.invoke$Response(productSearch, { q: query.trim() }).then((raw: any) => {
      const parsedData = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      const list = parsedData?.listProducts ?? parsedData?.products ?? (Array.isArray(parsedData) ? parsedData : []);
      this.resultadosBusquedaProductos.set(list);
    }).catch((err) => {
      console.error('❌ Error al buscar productos:', err);
      this.resultadosBusquedaProductos.set([]);
    }).finally(() => {
      this.buscandoProductos.set(false);
    });
  }

  /**
   * Consulta Detalle del movimiento por idMovement
   */
  cargarDetalle(idMovement: string): void {
    if (!idMovement) return;

    this.idSeleccionado.set(idMovement);
    this.detalleMovimiento.set(null);
    this.mostrarDialogo.set(true);
    this.loadingDetail.set(true);
    this.errorDetail.set('');

    this.api.invoke$Response(movementDetail, { idMovement }).then((raw: any) => {
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      this.detalleMovimiento.set(data);
    }).catch(() => {
      this.errorDetail.set('No se pudo obtener el detalle del movimiento.');
    }).finally(() => {
      this.loadingDetail.set(false);
    });
  }

  /**
   * Consulta Kardex del producto por idProduct
   */
  cargarKardexProducto(idProduct: string): void {
    if (!idProduct) return;

    this.idProductoSeleccionado.set(idProduct);
    this.loadingKardex.set(true);
    this.errorKardex.set('');

    this.api.invoke$Response(kardexProduct, { idProduct: idProduct.trim() }).then((raw: any) => {
      const parsedData = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;

      if (parsedData?.type !== 'success') {
        this.errorKardex.set(parsedData?.listMessage?.[0] ?? 'Error al consultar el kardex.');
        return;
      }

      this.kardexProductoData.set(parsedData);
    }).catch((err) => {
      console.error('❌ Error al obtener Kardex:', err);
      this.errorKardex.set('No se pudo conectar con el servidor.');
    }).finally(() => {
      this.loadingKardex.set(false);
    });
  }

  filtrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const tipo = this.tipoSeleccionado();
    const usr = this.usuarioSeleccionado();

    let lista = this.movimientos();

    if (tipo) lista = lista.filter((m: any) => m.type === tipo);
    if (usr) lista = lista.filter((m: any) => m.userName === usr);
    if (q) {
      lista = lista.filter((m: any) =>
        m.observation?.toLowerCase().includes(q) ||
        m.idMovement?.toLowerCase().includes(q) ||
        m.userName?.toLowerCase().includes(q)
      );
    }

    return lista;
  });

  onResetFiltros(): void {
    this.busqueda.set('');
    this.tipoSeleccionado.set('');
    this.usuarioSeleccionado.set('');
  }
}