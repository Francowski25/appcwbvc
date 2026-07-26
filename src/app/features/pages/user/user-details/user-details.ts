import { Component, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputText,
    Tooltip
  ],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css'
})
export class UserDetails {
  usuario = input<any>(null);

  onClose = output<void>();
  onSave = output<any>();

  editFirstName = signal<string>('');
  editSurName = signal<string>('');
  editDni = signal<string>('');
  editCellPhone = signal<string>('');
  editEmail = signal<string>('');
  editImage = signal<string>('');
  previewImage = signal<string>('');

  constructor() {
    effect(() => {
      const u = this.usuario();
      if (u) {
        this.editFirstName.set(u.firstName ?? '');
        this.editSurName.set(u.surName ?? '');
        this.editDni.set(u.dni ?? '');
        this.editCellPhone.set(u.cellPhone ?? '');
        this.editEmail.set(u.email ?? '');
        this.editImage.set(u.image ?? '');
        this.previewImage.set('');
      }
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.previewImage.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  restaurarImagen(): void {
    this.previewImage.set('');
  }

  guardarCambios(): void {
    const u = this.usuario();
    const usuarioActualizado = {
      ...u,
      firstName: this.editFirstName().trim(),
      surName: this.editSurName().trim(),
      dni: this.editDni().trim(),
      cellPhone: this.editCellPhone().trim(),
      email: this.editEmail().trim(),
      image: this.previewImage() || this.editImage()
    };

    this.onSave.emit(usuarioActualizado);
  }
}