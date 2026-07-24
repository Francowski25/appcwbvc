import { Component, input, output, signal } from '@angular/core';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [
    TagModule,
    TitleCasePipe,
    DatePipe,
    FormsModule,
    InputTextModule
  ],
  templateUrl: './category-detail.html',
  styleUrl: './category-detail.css',
})
export class CategoryDetail {
  categoria = input<any>(null);

  onClose = output<void>();
  onEditar = output<any>();

  isEditing = signal<boolean>(false);

  editName = signal<string>('');
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  closeDialog(): void {
    this.onClose.emit();
  }

  activarEdicion(): void {
    this.editName.set(this.categoria()?.name ?? '');
    this.previewUrl.set(null);
    this.selectedFile.set(null);
    this.isEditing.set(true);
  }

  cancelarEdicion(): void {
    this.isEditing.set(false);
    this.previewUrl.set(null);
    this.selectedFile.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = () => this.previewUrl.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  guardarCambios(): void {
    const datosActualizados = {
      ...this.categoria(),
      name: this.editName(),
      file: this.selectedFile()
    };

    this.onEditar.emit(datosActualizados);
    this.isEditing.set(false);
  }
}