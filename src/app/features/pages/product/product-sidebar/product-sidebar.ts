import { Component, input, output, signal, computed } from '@angular/core';
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

  busquedaCategoria = signal<string>('');
  busquedaLaboratorio = signal<string>('');

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

  onBuscarCategoria(event: Event): void {
    const element = event.target as HTMLInputElement;
    this.busquedaCategoria.set(element.value);
  }

  onBuscarLaboratorio(event: Event): void {
    const element = event.target as HTMLInputElement;
    this.busquedaLaboratorio.set(element.value);
  }

  seleccionarCategoria(name: string): void {
    this.categoriaChange.emit(name);
    this.busquedaCategoria.set('');
  }

  seleccionarLaboratorio(name: string): void {
    this.laboratorioChange.emit(name);
    this.busquedaLaboratorio.set('');
  }

  onSearch(event: Event): void {
    const element = event.target as HTMLInputElement;
    this.searchChange.emit(element.value);
  }

}