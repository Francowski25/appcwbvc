import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Api } from '../../../../api/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { inventoryGetall } from '../../../../api/functions';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    TooltipModule,
    DialogModule,
  ],
  templateUrl: './income.html',
  styleUrl: './income.css',
})
export class Income implements OnInit {
  private readonly api = inject(Api);

  movimientos = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');

  movimientoSeleccionado = signal<any>(null);
  showDetalle = signal<boolean>(false);

  // --- KPIs ---
  totalIngresos = computed(() => this.movimientos().length);

  totalUnidades = computed(() =>
    this.movimientos().reduce((acc, m) =>
      acc + (m.detalles ?? []).reduce((a: number, d: any) =>
        a + Number(d.quantity ?? 0), 0), 0)
  );

  costoTotal = computed(() =>
    this.movimientos().reduce((acc, m) =>
      acc + (m.detalles ?? []).reduce((a: number, d: any) =>
        a + (Number(d.quantity ?? 0) * Number(d.unitCost ?? 0)), 0), 0)
  );

  ultimoIngreso = computed(() => {
    if (this.movimientos().length === 0) return '—';
    return this.movimientos()
      .map(m => m.movementDate)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
  });

  ngOnInit(): void {
    this.loadIngresos();
  }

  private loadIngresos(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.invoke$Response(inventoryGetall).then((raw: any) => {
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;

      if (data.type !== 'success') {
        this.error.set(data.listMessage[0] ?? 'Error al cargar ingresos.');
        return;
      }

      this.movimientos.set(data.listMovements ?? []);

    }).catch(() => {
      this.error.set('Error al cargar ingresos.');
    }).finally(() => {
      this.loading.set(false);
    });
  }

  onVerDetalle(movimiento: any): void {
    this.movimientoSeleccionado.set(movimiento);
    this.showDetalle.set(true);
  }

  getTotalUnidadesMovimiento(movimiento: any): number {
    return (movimiento.detalles ?? []).reduce((acc: number, d: any) =>
      acc + Number(d.quantity ?? 0), 0);
  }

  getCostoMovimiento(movimiento: any): number {
    return (movimiento.detalles ?? []).reduce((acc: number, d: any) =>
      acc + (Number(d.quantity ?? 0) * Number(d.unitCost ?? 0)), 0);
  }

  getIdCorto(id: string): string {
    return id?.substring(0, 8).toUpperCase() ?? '—';
  }

  protected readonly Number = Number;
}