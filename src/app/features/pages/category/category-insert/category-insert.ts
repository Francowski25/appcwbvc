import { Component, output, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { Api } from '../../../../api/api';
import { categoryInsert } from '../../../../api/functions';

@Component({
  selector: 'app-category-insert',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    ProgressSpinnerModule
  ],
  templateUrl: './category-insert.html',
  styleUrl: './category-insert.css',
})
export class CategoryInsert {

  private readonly api = inject(Api);
  private readonly messageService = inject(MessageService);

  cerrarDialog = output<void>();
  categoriaRegistrada = output<void>();

  name = signal('');
  nameError = signal('');
  loading = signal(false);
  error = signal('');

  selectedFileName = signal('');
  previewUrl = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.selectedFileName.set(file.name);
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  cerrarModal(): void {
    this.resetForm();
    this.cerrarDialog.emit();
  }

  resetForm(): void {
    this.name.set('');
    this.nameError.set('');
    this.error.set('');
    this.loading.set(false);
    this.selectedFileName.set('');
    this.previewUrl.set(null);
  }

  async onSubmit(): Promise<void> {
    this.nameError.set('');
    this.error.set('');

    if (!this.name().trim()) {
      this.nameError.set('El nombre es requerido.');
      return;
    }

    this.loading.set(true);

    try {
      const raw: any = await this.api.invoke$Response(categoryInsert, {
        body: {
          name: this.name().trim(),
          image: this.previewUrl() ?? undefined,
        }
      });

      const res = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;

      switch (res.type) {
        case 'success':
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: res.listMessage?.[0] ?? 'Categoría registrada exitosamente.',
            life: 4000
          });
          this.resetForm();
          this.categoriaRegistrada.emit();
          break;
        case 'warning':
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: res.listMessage?.[0] ?? 'Ocurrió una advertencia.',
            life: 5000
          });
          break;
        default:
          this.error.set(res.listMessage?.[0] ?? 'Error al registrar.');
      }
    } catch {
      this.error.set('No se pudo conectar con el servidor.');
    } finally {
      this.loading.set(false);
    }
  }
}