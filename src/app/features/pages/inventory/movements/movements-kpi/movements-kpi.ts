import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movements-kpi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movements-kpi.html',
  styleUrl: './movements-kpi.css',
})
export class MovementsKpi {
  movimientos = input<any[]>([]);

  total = computed(() => this.movimientos().length);
  entradas = computed(() => this.movimientos().filter((m) => m.type === 'Entrada').length);
  salidas = computed(() => this.movimientos().filter((m) => m.type === 'Salida').length);
  ajustesPositivos = computed(() => this.movimientos().filter((m) => m.type === 'Ajuste_Positivo').length);
  ajustesNegativos = computed(() => this.movimientos().filter((m) => m.type === 'Ajuste_Negativo').length);

  usuariosUnicos = computed(() => {
    const usrs = this.movimientos().map((m) => m.userName).filter(Boolean);
    return new Set(usrs).size;
  });

}