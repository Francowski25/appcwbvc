import { Component, model, output, input, signal, computed, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../../services/auth.service';
import { Api } from '../../../../../api/api';
import { lotByproduct, MovementCreate$Params } from '../../../../../api/functions';

export type TipoMovimiento = 'Entrada' | 'Salida' | 'Ajuste_Positivo' | 'Ajuste_Negativo';

export interface DetalleItemUI {
  idProduct: string;
  productName: string;
  idLot: string;
  lotCode: string;
  expirationDate?: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  idSupplier?: string;
}

@Component({
  selector: 'app-movements-new',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    DecimalPipe
  ],
  templateUrl: './movements-new.html',
  styleUrl: './movements-new.css',
})
export class MovementsNew {
  private readonly authService = inject(AuthService);
  private readonly api = inject(Api);
  private readonly messageService = inject(MessageService);

  user = this.authService.currentUser;

  visible = model<boolean>(false);
  searchResults = input<any[]>([]);
  searchingProduct = input<boolean>(false);

  onSearchProduct = output<string>();
  saved = output<NonNullable<MovementCreate$Params['body']>>();

  pasoActual = signal<number>(1);
  tipoMovimiento = signal<TipoMovimiento>('Entrada');
  observacion = signal<string>('');

  productoBusqueda = signal<string>('');
  productoSeleccionado = signal<any | null>(null);
  mostrarDropdownProducto = signal<boolean>(false);

  lotesProducto = signal<any[]>([]);
  loteSeleccionado = signal<any | null>(null);
  loadingLotes = signal<boolean>(false);

  cantidad = signal<number>(1);
  costoUnitario = signal<number>(0);

  listaDetalle = signal<DetalleItemUI[]>([]);

  puedeAgregarProducto = computed(() => {
    return !!this.productoSeleccionado() &&
      !!this.loteSeleccionado() &&
      this.cantidad() > 0;
  });

  costoTotalCalculado = computed(() => {
    return this.listaDetalle().reduce((acc, item) => acc + (item.subtotal || 0), 0);
  });

  seleccionarTipo(tipo: TipoMovimiento): void {
    this.tipoMovimiento.set(tipo);
  }

  siguientePaso(): void {
    this.pasoActual.set(2);
  }

  onInputProducto(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.productoBusqueda.set(val);

    if (!val.trim()) {
      this.resetSeleccionProducto();
      return;
    }

    if (val.trim().length >= 2) {
      this.onSearchProduct.emit(val.trim());
      this.mostrarDropdownProducto.set(true);
    } else {
      this.mostrarDropdownProducto.set(false);
    }
  }

  seleccionarProductoCatalogo(prod: any): void {
    this.productoSeleccionado.set(prod);
    this.productoBusqueda.set(prod.name ?? prod.productName ?? '');

    const costoBase = Number(prod.cost ?? prod.unitCost ?? prod.purchasePrice ?? prod.priceSale ?? 0);
    this.costoUnitario.set(costoBase);

    this.mostrarDropdownProducto.set(false);

    const idProduct = String(prod.idProduct ?? prod.id);
    this.cargarLotesPorProducto(idProduct);
  }

  private cargarLotesPorProducto(idProduct: string): void {
    this.loadingLotes.set(true);
    this.lotesProducto.set([]);
    this.loteSeleccionado.set(null);

    this.api.invoke$Response(lotByproduct, { idProduct })
      .then((raw: any) => {
        const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;

        if (data.type === 'success') {
          const lista = data?.listLots ?? data?.lots ?? [];
          this.lotesProducto.set(lista);

          if (lista.length > 0) {
            const primerLote = lista[0];
            this.loteSeleccionado.set(primerLote);

            const precioLote = Number(primerLote.purchasePrice ?? primerLote.unitCost ?? primerLote.cost ?? 0);
            if (precioLote > 0) {
              this.costoUnitario.set(precioLote);
            }
          }
        }
      })
      .finally(() => this.loadingLotes.set(false));
  }

  seleccionarLote(lot: any): void {
    this.loteSeleccionado.set(lot);

    const precioLote = Number(lot.purchasePrice ?? lot.unitCost ?? lot.cost ?? 0);
    if (precioLote > 0) {
      this.costoUnitario.set(precioLote);
    }
  }

  onLoteChange(event: Event): void {
    const idLot = (event.target as HTMLSelectElement).value;
    const lote = this.lotesProducto().find(l => String(l.idLot ?? l.id) === String(idLot)) ?? null;
    if (lote) {
      this.seleccionarLote(lote);
    }
  }

  agregarProducto(): void {
    const prod = this.productoSeleccionado();
    const lote = this.loteSeleccionado();
    const qty = Number(this.cantidad());
    const cost = Number(this.costoUnitario());

    if (!prod || !lote || qty <= 0) return;

    const nuevoDetalle: DetalleItemUI = {
      idProduct: String(prod.idProduct ?? prod.id),
      productName: prod.name ?? prod.productName ?? 'Producto',
      idLot: String(lote.idLot ?? lote.id),
      lotCode: lote.code ?? lote.lotCode ?? 'S/L',
      expirationDate: lote.expirationDate ?? lote.dueDate,
      quantity: qty,
      unitCost: cost,
      subtotal: qty * cost,
      idSupplier: prod.idSupplier ?? undefined
    };

    this.listaDetalle.update(items => [...items, nuevoDetalle]);
    this.resetSeleccionProducto();
  }

  private resetSeleccionProducto(): void {
    this.productoSeleccionado.set(null);
    this.productoBusqueda.set('');
    this.lotesProducto.set([]);
    this.loteSeleccionado.set(null);
    this.loadingLotes.set(false);
    this.cantidad.set(1);
    this.costoUnitario.set(0);
  }

  eliminarItem(index: number): void {
    this.listaDetalle.update(items => items.filter((_, i) => i !== index));
  }

  guardarMovimiento(): void {
    if (this.listaDetalle().length === 0) return;

    const currentUser = this.user();

    const payload: NonNullable<MovementCreate$Params['body']> = {
      type: this.tipoMovimiento(),
      observation: this.observacion().trim(),
      idUser: currentUser?.idUser ? String(currentUser.idUser) : (currentUser?.id ? String(currentUser.id) : ''),
      details: this.listaDetalle().map(item => ({
        idProduct: item.idProduct,
        idLot: item.idLot,
        quantity: item.quantity,
        unitCost: item.unitCost,
        expirationDate: item.expirationDate,
        idSupplier: item.idSupplier
      }))
    };

    this.saved.emit(payload);
    this.cerrarModal();
  }

  cerrarModal(): void {
    this.visible.set(false);
    this.resetearFormulario();
  }

  resetearFormulario(): void {
    this.pasoActual.set(1);
    this.tipoMovimiento.set('Entrada');
    this.observacion.set('');
    this.listaDetalle.set([]);
    this.resetSeleccionProducto();
  }
}