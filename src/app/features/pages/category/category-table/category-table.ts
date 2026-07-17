import { Component, input, output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-category-table',
  standalone: true,
  imports: [
    TitleCasePipe,
    TableModule,
    TooltipModule
  ],
  templateUrl: './category-table.html',
  styleUrl: './category-table.css',
})
export class CategoryTable {
  categorias = input<any[]>([]);
  total = input<number>(0);
  loading = input<boolean>(false);
  error = input<string>('');

  crearCategoria = output<void>();
  onEdit = output<any>();
  onToggleStatus = output<any>();
  onDelete = output<any>();
  onExportExcel = output<void>();
  onExportPdf = output<void>();
}