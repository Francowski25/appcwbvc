import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Api } from '../../../../api/api';
import { userGetall, userStatus } from '../../../../api/functions';
import { UsersSidebar } from '../users-sidebar/users-sidebar';
import { UsersTable } from '../users-table/users-table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UserKpi } from '../user-kpi/user-kpi';
import { UsersInsert } from '../user-insert/user-insert';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    UsersSidebar,
    UsersTable,
    UserKpi,
    UsersInsert,
    DialogModule,
    ConfirmDialogModule,
  ],
  templateUrl: './users-getall.html',
  styleUrl: './users-getall.css',
})
export class UsersList implements OnInit {
  private readonly api = inject(Api);
  private readonly messageService = inject(MessageService);

  usuarios = signal<any[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');
  busqueda = signal<string>('');
  rol = signal<string>('');
  estado = signal<string>('');
  showInsertDialog = signal<boolean>(false);

  private readonly currentUser: { email: string } | null = (() => {
    try {
      const raw = localStorage.getItem('current_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  totalUsuarios = computed(() => this.usuarios().length);

  filtrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const filterRol = this.rol().toLowerCase();
    const filterEstado = this.estado().toLowerCase();
    let result = this.usuarios();

    if (q) {
      result = result.filter((u: any) =>
        u.firstName?.toLowerCase().includes(q) ||
        u.surName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
      );
    }
    if (filterRol) result = result.filter((u: any) => u.role?.toLowerCase() === filterRol);
    if (filterEstado) result = result.filter((u: any) => u.status?.toLowerCase() === filterEstado);

    return result;
  });

  totalesPorRol = computed(() => ({
    administrador: this.usuarios().filter((u: any) => u.role?.toLowerCase() === 'administrador').length,
    quimico: this.usuarios().filter((u: any) => u.role?.toLowerCase() === 'quimico').length,
    vendedor: this.usuarios().filter((u: any) => u.role?.toLowerCase() === 'vendedor').length,
  }));

  usuariosDelRolActual = computed(() => {
    const filterRol = this.rol().toLowerCase();
    if (!filterRol) return this.usuarios();
    return this.usuarios().filter((u: any) => u.role?.toLowerCase() === filterRol);
  });

  totalActivos = computed(() =>
    this.usuariosDelRolActual().filter((u: any) => u.status?.toLowerCase() === 'activo').length
  );

  totalInactivos = computed(() =>
    this.usuariosDelRolActual().filter((u: any) => u.status?.toLowerCase() !== 'activo').length
  );

  ngOnInit(): void {
    this.initialization();
  }

  private initialization(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.invoke$Response(userGetall).then((raw: any) => {
      const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
      if (data.type !== 'success') {
        this.error.set(data.listMessage[0] ?? 'Error al cargar usuarios.');
        return;
      }
      const listaApi: any[] = data.listUsers ?? [];
      this.usuarios.set(
        this.currentUser?.email
          ? listaApi.filter((u: any) => u.email !== this.currentUser!.email)
          : listaApi
      );
    }).catch(() => {
      this.error.set('Error al cargar usuarios.');
    }).finally(() => {
      this.loading.set(false);
    });
  }

  onBusquedaChange(valor: string): void { this.busqueda.set(valor); }
  onCrearUsuario(): void { this.showInsertDialog.set(true); }

  onUsuarioRegistrado(): void {
    this.showInsertDialog.set(false);
    this.initialization();
  }

  onEditar(user: any): void { }
  onChangePassword(user: any): void { }

  onToggleStatus(user: any): void {
    const nuevoEstado = user.status?.toLowerCase() === 'activo' ? 'inactivo' : 'activo';

    this.api.invoke$Response(userStatus, { id: user.idUser, newStatus: nuevoEstado })
      .then((raw: any) => {
        const res = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
        if (res.type === 'success') {
          user.status = nuevoEstado;
          this.usuarios.set([...this.usuarios()]);
          this.messageService.add({ severity: 'success', summary: 'Estado cambiado', detail: res.listMessage[0] || 'Estado actualizado.', life: 4000 });
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: res.listMessage[0] || 'No se pudo procesar.', life: 4000 });
        }
      })
      .catch(() => {
        this.messageService.add({ severity: 'error', summary: 'Sin conexión', detail: 'El servidor no respondió.', life: 4000 });
      });
  }

  exportCSV(): void { }
}