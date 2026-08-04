import { Component, ElementRef, HostListener, inject, input, output, signal, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-product-kardex',
  standalone: true,
  imports: [DatePipe, DecimalPipe, PaginatorModule],
  templateUrl: './product-kardex.html',
  styleUrl: './product-kardex.css',
})
export class ProductKardex {
  private readonly elementRef = inject(ElementRef);

  kardexData = input<any | null>(null);
  loading = input<boolean>(false);
  searchResults = input<any[]>([]);
  searchingProduct = input<boolean>(false);

  onSearchProduct = output<string>();
  onSelectProduct = output<string>();

  searchProductQuery = signal<string>('');
  showProductDropdown = signal<boolean>(false);
  selectedProduct = signal<any | null>(null);

  first = signal<number>(0);
  filasPorPagina = signal<number>(10);

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((query) => {
        if (query.trim().length >= 2) {
          this.onSearchProduct.emit(query.trim());
          this.showProductDropdown.set(true);
        } else {
          this.showProductDropdown.set(false);
        }
      });
  }


  kardexList = computed(() => {
    const data = this.kardexData();
    if (!data) return [];
    return data.listKardex ?? data.movements ?? data.details ?? (Array.isArray(data) ? data : []);
  });

  saldoActual = computed(() => {
    const data = this.kardexData();
    if (data?.saldoActual !== undefined) return Number(data.saldoActual);
    const list = this.kardexList();
    if (list.length > 0) {
      return Number(list[0].saldoResultante ?? list[0].saldo ?? 0);
    }
    return Number(this.selectedProduct()?.stock ?? 0);
  });

  totalEntradas = computed(() => {
    return this.kardexList()
      .filter((m: any) => m.type === 'Entrada' || (m.movimiento ?? m.quantity ?? 0) > 0)
      .reduce((acc: number, m: any) => acc + Math.abs(Number(m.movimiento ?? m.quantity ?? 0)), 0);
  });

  totalSalidas = computed(() => {
    return this.kardexList()
      .filter((m: any) => m.type === 'Salida' || (m.movimiento ?? m.quantity ?? 0) < 0)
      .reduce((acc: number, m: any) => acc + Math.abs(Number(m.movimiento ?? m.quantity ?? 0)), 0);
  });

  productName = computed(() => {
    const sel = this.selectedProduct();
    return sel?.name ?? sel?.productName ?? this.kardexData()?.productName ?? 'Producto';
  });


  paginatedList = computed(() => {
    const start = this.first();
    const end = start + this.filasPorPagina();
    return this.kardexList().slice(start, end);
  });

  primerRegistro = computed(() => {
    if (this.kardexList().length === 0) return 0;
    return this.first() + 1;
  });

  ultimoRegistro = computed(() => {
    const total = this.kardexList().length;
    const posibleFin = this.first() + this.filasPorPagina();
    return posibleFin > total ? total : posibleFin;
  });

  onPageChange(event: PaginatorState): void {
    if (event.first !== undefined) {
      this.first.set(event.first);
    }
    if (event.rows !== undefined) {
      this.filasPorPagina.set(event.rows);
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.showProductDropdown.set(false);
    }
  }

  onProductSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchProductQuery.set(val);
    this.searchSubject.next(val);
  }

  onInputFocus(): void {
    if (this.searchProductQuery().trim().length >= 2) {
      this.showProductDropdown.set(true);
    }
  }

  selectProduct(product: any): void {
    this.selectedProduct.set(product);
    const nameToDisplay = product.name ?? product.productName ?? '';
    this.searchProductQuery.set(nameToDisplay);

    this.showProductDropdown.set(false);
    this.first.set(0);

    this.onSelectProduct.emit(product.idProduct);
  }

  clearSearch(): void {
    this.searchProductQuery.set('');
    this.showProductDropdown.set(false);
    this.selectedProduct.set(null);
    this.first.set(0);
  }

  isExpired(dateStr: string): boolean {
    if (!dateStr) return false;
    const expDate = new Date(dateStr);
    return expDate < new Date();
  }
}