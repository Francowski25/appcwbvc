import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-warehouse',
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TagModule
  ],
  templateUrl: './warehouse.html',
  styleUrl: './warehouse.css',
})
export class Warehouse {
  searchTerm: string = '';
  displayModalIngreso: boolean = false;
  filtroEstado: string = 'TODOS';

  inventario = [
    { id: 1, codigo: 'PROD-001', nombre: 'Paracetamol 500mg', laboratorio: 'Portugal', lote: 'L-99821', stockActual: 150, stockMinimo: 50, vencimiento: '2028-05-12', estado: 'Normal' },
    { id: 2, codigo: 'PROD-042', nombre: 'Amoxicilina 500mg', laboratorio: 'Bayer', lote: 'L-22410', stockActual: 12, stockMinimo: 30, vencimiento: '2027-11-20', estado: 'Quiebre de Stock' },
    { id: 3, codigo: 'PROD-109', nombre: 'Ibuprofeno 400mg', laboratorio: 'Genfar', lote: 'L-88291', stockActual: 85, stockMinimo: 20, vencimiento: '2026-09-15', estado: 'Por Vencer' },
    { id: 4, codigo: 'PROD-015', nombre: 'Cetirizina 10mg', laboratorio: 'Medifarma', lote: 'L-00342', stockActual: 200, stockMinimo: 40, vencimiento: '2029-01-10', estado: 'Normal' }
  ];

  laboratorios = [
    { label: 'Portugal', value: 'Portugal' },
    { label: 'Bayer', value: 'Bayer' },
    { label: 'Genfar', value: 'Genfar' },
    { label: 'Medifarma', value: 'Medifarma' }
  ];

  nuevoIngreso = { codigo: '', nombre: '', laboratorio: '', lote: '', cantidad: 0, vencimiento: '' };

  abrirModalIngreso() {
    this.nuevoIngreso = { codigo: '', nombre: '', laboratorio: '', lote: '', cantidad: 0, vencimiento: '' };
    this.displayModalIngreso = true;
  }

  registrarIngreso() {
    if (this.nuevoIngreso.nombre && this.nuevoIngreso.cantidad > 0) {
      let estadoInicial = 'Normal';
      if (this.nuevoIngreso.cantidad <= 20) estadoInicial = 'Quiebre de Stock';

      this.inventario.push({
        id: this.inventario.length + 1,
        codigo: this.nuevoIngreso.codigo || 'PROD-' + Math.floor(Math.random() * 900 + 100),
        nombre: this.nuevoIngreso.nombre,
        laboratorio: this.nuevoIngreso.laboratorio,
        lote: this.nuevoIngreso.lote,
        stockActual: this.nuevoIngreso.cantidad,
        stockMinimo: 20,
        vencimiento: this.nuevoIngreso.vencimiento,
        estado: estadoInicial
      });
      this.displayModalIngreso = false;
    }
  }

  getSeverity(estado: string): 'success' | 'warn' | 'danger' {
    switch (estado) {
      case 'Normal': return 'success';
      case 'Por Vencer': return 'warn';
      case 'Quiebre de Stock': return 'danger';
      default: return 'success';
    }
  }

  getFilteredInventario() {
    return this.inventario.filter(item => {
      const matchSearch = item.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.lote.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.codigo.toLowerCase().includes(this.searchTerm.toLowerCase());

      if (this.filtroEstado === 'TODOS') return matchSearch;
      return matchSearch && item.estado === this.filtroEstado;
    });
  }

  getTotalNormal(): number { return this.inventario.filter(item => item.estado === 'Normal').length; }
  getTotalPorVencer(): number { return this.inventario.filter(item => item.estado === 'Por Vencer').length; }
  getTotalQuiebre(): number { return this.inventario.filter(item => item.estado === 'Quiebre de Stock').length; }
}