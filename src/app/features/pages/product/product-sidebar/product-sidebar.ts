import { Component, input, output, signal, computed, effect } from '@angular/core';
import { NgClass } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

interface Categoria {
  name: string;
  count: number;
}

interface Laboratorio {
  name: string;
  count: number;
}

@Component({
  selector: 'app-product-sidebar',
  standalone: true,
  imports: [
    NgClass,
    IconFieldModule,
    InputIconModule,
    InputTextModule
  ],
  templateUrl: './product-sidebar.html',
  styleUrl: './product-sidebar.css',
})
export class ProductSidebar {
  categorias = input<Categoria[]>([]);
  laboratorios = input<Laboratorio[]>([]);
  categoriaSeleccionada = input<string>('');
  laboratorioSeleccionado = input<string>('');

  categoriaChange = output<string>();
  laboratorioChange = output<string>();
  searchChange = output<string>();

  busquedaGeneral = signal<string>('');
  busquedaCategoria = signal<string>('');
  busquedaLaboratorio = signal<string>('');

  constructor() {
    effect(() => {
      this.busquedaCategoria.set(this.categoriaSeleccionada());
    }, { allowSignalWrites: true });

    effect(() => {
      this.busquedaLaboratorio.set(this.laboratorioSeleccionado());
    }, { allowSignalWrites: true });
  }

  categoriasFiltradas = computed(() => {
    const q = this.busquedaCategoria().toLowerCase().trim();
    if (!q) return [];
    return this.categorias().filter(c => c.name.toLowerCase().includes(q));
  });

  laboratoriosFiltrados = computed(() => {
    const q = this.busquedaLaboratorio().toLowerCase().trim();
    if (!q) return [];
    return this.laboratorios().filter(l => l.name.toLowerCase().includes(q));
  });

  esSeleccionExactaCategoria(): boolean {
    const q = this.busquedaCategoria().toLowerCase().trim();
    return this.categorias().some(c => c.name.toLowerCase() === q);
  }

  esSeleccionExactaLaboratorio(): boolean {
    const q = this.busquedaLaboratorio().toLowerCase().trim();
    return this.laboratorios().some(l => l.name.toLowerCase() === q);
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.busquedaGeneral.set(value);
    this.searchChange.emit(value);
  }

  onBuscarCategoria(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.busquedaCategoria.set(value);
    this.categoriaChange.emit(value);
  }

  onBuscarLaboratorio(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.busquedaLaboratorio.set(value);
    this.laboratorioChange.emit(value);
  }

  seleccionarCategoria(name: string): void {
    this.busquedaCategoria.set(name);
    this.categoriaChange.emit(name);
  }

  seleccionarLaboratorio(name: string): void {
    this.busquedaLaboratorio.set(name);
    this.laboratorioChange.emit(name);
  }

  limpiarBusquedaGeneral(): void {
    this.busquedaGeneral.set('');
    this.searchChange.emit('');
  }

  limpiarCategoria(): void {
    this.busquedaCategoria.set('');
    this.categoriaChange.emit('');
  }

  limpiarLaboratorio(): void {
    this.busquedaLaboratorio.set('');
    this.laboratorioChange.emit('');
  }

  limpiarTodosLosFiltros(): void {
    this.limpiarBusquedaGeneral();
    this.limpiarCategoria();
    this.limpiarLaboratorio();
  }
}