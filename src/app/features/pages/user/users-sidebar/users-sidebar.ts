import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-users-sidebar',
  standalone: true,
  imports: [
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    CommonModule
  ],
  templateUrl: './users-sidebar.html',
  styleUrl: './users-sidebar.css',
})
export class UsersSidebar {
  busquedaValue = input<string>('');
  roleValue = input<string>('');
  estadoValue = input<string>('');

  busquedaChange = output<string>();
  roleChange = output<string>();
  estadoChange = output<string>();

  totalUsuarios = input<number>(0);
  activo = input<number>(0);
  inactivo = input<number>(0);

  countsByRole = input<Record<string, number>>({ administrador: 0, quimico: 0, vendedor: 0 });
  roles = [
    { label: 'Administrador', value: 'administrador' },
    { label: 'Químico', value: 'quimico' },
    { label: 'Vendedor', value: 'vendedor' },
  ];

  estados = [
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' },
  ];
  seleccionarRol(val: string) {
    this.roleChange.emit(val);
  }

  seleccionarEstado(val: string) {
    this.estadoChange.emit(val);
  }
}