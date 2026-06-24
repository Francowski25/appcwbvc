import { Component, input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-lot-table',
  imports: [TableModule, TagModule],
  templateUrl: './lot-table.html',
})
export class LotTable {
  lotes = input.required<any[]>();
  loading = input<boolean>(false);
  error = input<string>('');

  protected readonly Number = Number;

  getBadgeEstado(estado: string): { text: string; dot: string } {
    switch (estado) {
      case 'Vigente': return { text: 'text-green-600', dot: 'bg-green-500' };
      case 'Por vencer': return { text: 'text-orange-500', dot: 'bg-orange-400' };
      case 'Vencido': return { text: 'text-red-600', dot: 'bg-red-500' };
      default: return { text: 'text-gray-500', dot: 'bg-gray-400' };
    }
  }
}