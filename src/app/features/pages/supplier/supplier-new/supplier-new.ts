import { Component, input, output, inject, effect, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Api } from '../../../../api/api';
import { supplierInsert, SupplierInsert$Params, supplierUpdate, SupplierUpdate$Params } from '../../../../api/functions';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-supplier-new',
  standalone: true,
  imports: [DialogModule, InputTextModule, ButtonModule, FormsModule],
  templateUrl: './supplier-new.html',
  styleUrl: './supplier-new.css',
})
export class SupplierNew {
  private readonly api = inject(Api);

  visible = input<boolean>(false);
  proveedor = input<any>(null);

  visibleChange = output<boolean>();
  guardado = output<void>();

  loading = signal<boolean>(false);
  error = signal<string>('');

  form = signal({
    name: '',
    ruc: '',
    phone: '',
    address: '',
    email: '',
  });

  esEdicion = signal<boolean>(false);

  constructor() {
    effect(() => {
      const p = this.proveedor();
      if (p) {
        this.esEdicion.set(true);
        this.form.set({
          name: p.name ?? '',
          ruc: p.ruc ?? '',
          phone: p.phone ?? '',
          address: p.address ?? '',
          email: p.email ?? '',
        });
      } else {
        this.esEdicion.set(false);
        this.form.set({ name: '', ruc: '', phone: '', address: '', email: '' });
      }
      this.error.set('');
    });
  }

  updateField(field: string, value: string): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  onGuardar(): void {
    if (!this.form().name.trim()) {
      this.error.set('El nombre es obligatorio.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    if (this.esEdicion()) {
      // ← body anidado
      const payload: SupplierUpdate$Params = {
        body: {
          idSupplier: this.proveedor().idSupplier,
          name: this.form().name,
          ruc: this.form().ruc,
          phone: this.form().phone,
          address: this.form().address,
          email: this.form().email,
        }
      };
      this.api.invoke$Response(supplierUpdate, payload).then((raw: any) => {
        const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
        if (data.type !== 'success') {
          this.error.set(data.listMessage[0] ?? 'Error al actualizar.');
          return;
        }
        this.guardado.emit();
      }).catch(() => {
        this.error.set('Error al actualizar proveedor.');
      }).finally(() => {
        this.loading.set(false);
      });

    } else {
      // ← insert igual que antes
      const payload: SupplierInsert$Params = {
        body: {
          name: this.form().name,
          ruc: this.form().ruc,
          phone: this.form().phone,
          address: this.form().address,
          email: this.form().email,
        }
      };
      this.api.invoke$Response(supplierInsert, payload).then((raw: any) => {
        const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
        if (data.type !== 'success') {
          this.error.set(data.listMessage[0] ?? 'Error al registrar.');
          return;
        }
        this.guardado.emit();
      }).catch(() => {
        this.error.set('Error al registrar proveedor.');
      }).finally(() => {
        this.loading.set(false);
      });
    }
  }
  onCerrar(): void {
    this.visibleChange.emit(false);
  }
}