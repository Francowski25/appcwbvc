import { TitleCasePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-laboratory-table',
  imports: [
    TitleCasePipe,
    TableModule,
    TooltipModule
  ],
  standalone: true,
  templateUrl: './laboratory-table.html',
  styleUrl: './laboratory-table.css',
})
export class LaboratoryTable {
  laboratorios = input<any[]>([]);
  total = input<number>(0);
  loading = input<boolean>(false);
  error = input<string>('');

  crearLaboratorio = output<void>();
  onEdit = output<any>();
  onToggleStatus = output<any>();
  onExportExcel = output<void>();
  onExportPdf = output<void>();
}
