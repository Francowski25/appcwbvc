import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";

@Component({
  selector: 'app-laboratory-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    IconField,
    InputIcon
  ],
  templateUrl: './laboratory-sidebar.html',
  styleUrl: './laboratory-sidebar.css'
})
export class LaboratorySidebar {
  busquedaValue = input<string>('');
  estadoValue = input<string>('');
  totalLaboratories = input<number>(0);
  totalActivas = input<number>(0);
  totalInactivas = input<number>(0);

  busquedaChange = output<string>();
  estadoChange = output<string>();
  crearLaboratorio = output<void>();
}