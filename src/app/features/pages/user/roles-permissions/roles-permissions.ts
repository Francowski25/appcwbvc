import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-roles-permisos',
  standalone: true,
  imports: [
    FormsModule,
    TableModule,
    CheckboxModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TagModule
  ],
  templateUrl: './roles-permissions.html',
  styleUrl: './roles-permissions.css',
})
export class RolesPermissions {
  selectedRol: any = null;

  roles = [
    { id: 1, nombre: 'Administrador', descripcion: 'Acceso total a todas las configuraciones, reportes, auditorías y gestión de personal.', usuariosCount: 2, estado: 'Activo' },
    { id: 2, nombre: 'Vendedor', descripcion: 'Atención al cliente, emisión de comprobantes, control de turnos y consultas de stock rápido.', usuariosCount: 5, estado: 'Activo' },
    { id: 3, nombre: 'Químico Farmacéutico', descripcion: 'Validación de recetas, control técnico de lotes, alertas de vencimiento y gestión regulatoria.', usuariosCount: 1, estado: 'Activo' }
  ];

  permisosPorModulo = [
    {
      nombre: 'Productos',
      permisos: [
        { id: 'prod_lista', descripcion: 'Acceso a Lista de Productos', activo: false },
        { id: 'prod_categ', descripcion: 'Gestionar Categorías', activo: false },
        { id: 'prod_lab', descripcion: 'Gestionar Laboratorios', activo: false }
      ]
    },
    {
      nombre: 'Inventario',
      permisos: [
        { id: 'inv_stock', descripcion: 'Ver Stock Actual', activo: false },
        { id: 'inv_lotes', descripcion: 'Control de Lotes', activo: false },
        { id: 'inv_ingresos', descripcion: 'Registrar Ingresos', activo: false },
        { id: 'inv_mov', descripcion: 'Ver Movimientos de Almacén', activo: false }
      ]
    },
    {
      nombre: 'Compras',
      permisos: [
        { id: 'comp_hist', descripcion: 'Ver Historial de Compras', activo: false },
        { id: 'comp_prov', descripcion: 'Gestionar Proveedores', activo: false }
      ]
    },
    {
      nombre: 'Ventas',
      permisos: [
        { id: 'vent_nueva', descripcion: 'Efectuar Nueva Venta', activo: false },
        { id: 'vent_hist', descripcion: 'Consultar Historial de Ventas', activo: false }
      ]
    },
    {
      nombre: 'Usuarios y Clientes',
      permisos: [
        { id: 'user_lista', descripcion: 'Administrar Personal del Sistema', activo: false },
        { id: 'user_roles', descripcion: 'Modificar Roles y Permisos', activo: false },
        { id: 'cli_lista', descripcion: 'Gestionar Padrón de Clientes', activo: false }
      ]
    },
    {
      nombre: 'Reportes y Operaciones',
      permisos: [
        { id: 'rep_financieros', descripcion: 'Ver Reportes Gerenciales (Ventas/Compras)', activo: false },
        { id: 'op_vencer', descripcion: 'Alertas de Productos por Vencer', activo: false },
        { id: 'op_alertas', descripcion: 'Alertas de Quiebre de Stock', activo: false }
      ]
    }
  ];

  onRolSelect(event: any) {
    const rol = this.selectedRol.nombre;
    this.permisosPorModulo.forEach(m => {
      m.permisos.forEach(p => {
        if (rol === 'Administrador') {
          p.activo = true;
        } else if (rol === 'Vendedor') {
          p.activo = p.id.startsWith('vent_') || p.id === 'inv_stock' || p.id === 'cli_lista';
        } else if (rol === 'Químico Farmacéutico') {
          p.activo = p.id.startsWith('prod_') || p.id.startsWith('inv_') || p.id.startsWith('op_');
        }
      });
    });
  }

  guardarPermiso(rolId: number, permisoId: string, value: boolean) {
  }

  getSeverity(estado: string): 'success' | 'danger' {
    return estado === 'Activo' ? 'success' : 'danger';
  }
}