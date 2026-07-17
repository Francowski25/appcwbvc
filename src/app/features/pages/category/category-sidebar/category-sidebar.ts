import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";

@Component({
  selector: 'app-category-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    IconField,
    InputIcon
  ],
  templateUrl: './category-sidebar.html',
  styleUrl: './category-sidebar.css'
})
export class CategorySidebar {
  busquedaValue = input<string>('');
  estadoValue = input<string>('');
  totalCategorias = input<number>(0);
  totalActivas = input<number>(0);
  totalInactivas = input<number>(0);

  busquedaChange = output<string>();
  estadoChange = output<string>();
  crearCategoria = output<void>();
}