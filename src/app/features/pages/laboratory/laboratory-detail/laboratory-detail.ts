import { Component, input, output, signal } from '@angular/core';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-laboratory-detail',
  standalone: true,
  imports: [
    TagModule,
    InputTextModule,
    FormsModule,
    TitleCasePipe,
    DatePipe
  ],
  templateUrl: './laboratory-detail.html',
  styleUrl: './laboratory-detail.css',
})
export class LaboratoryDetail {
  laboratorio = input<any>(null);

  onClose = output<void>();
  onEditar = output<any>();

  isEditing = signal<boolean>(false);
  editName = signal<string>('');
  previewUrl = signal<string | null>(null);

  activarEdicion(): void {
    this.editName.set(this.laboratorio()?.name ?? '');
    this.previewUrl.set(null);
    this.isEditing.set(true);
  }

  cancelarEdicion(): void {
    this.isEditing.set(false);
    this.previewUrl.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  guardarCambios(): void {
    const datosActualizados = {
      ...this.laboratorio(),
      name: this.editName().trim(),
      image: this.previewUrl() ?? this.laboratorio()?.image
    };

    this.onEditar.emit(datosActualizados);
    this.isEditing.set(false);
  }

  closeDialog(): void {
    this.cancelarEdicion();
    this.onClose.emit();
  }
}