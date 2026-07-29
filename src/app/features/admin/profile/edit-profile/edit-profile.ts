import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { Api } from '../../../../api/api';
import { userUpdateProfile, UserUpdateProfile$Params } from '../../../../api/functions';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './edit-profile.html'
})
export class EditProfile {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(Api);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  user = input<any>();
  closeModal = output<void>();
  usuarioActualizado = output<void>();

  loading = signal<boolean>(false);

  editProfileForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    surName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    cellPhone: ['', [Validators.pattern(/^[0-9+\s-]{7,15}$/)]],
    image: ['']
  });

  constructor() {
    effect(() => {
      this.resetFormToUser();
    });
  }

  public resetFormToUser(): void {
    const u = this.user();
    if (u) {
      this.editProfileForm.reset({
        firstName: u.firstName ?? '',
        surName: u.surName ?? '',
        email: u.email ?? '',
        cellPhone: u.cellPhone ?? '',
        image: u.image ?? ''
      });
    } else {
      this.editProfileForm.reset();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.size > 2 * 1024 * 1024) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Archivo pesado',
          detail: 'La imagen supera los 2MB permitidos.',
          life: 4000
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.editProfileForm.patchValue({ image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.editProfileForm.patchValue({ image: '' });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.editProfileForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onCancel(): void {
    this.resetFormToUser();
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.editProfileForm.invalid) {
      this.editProfileForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Formulario incompleto',
        detail: 'Por favor completa los campos marcados correctamente.',
        life: 4000
      });
      return;
    }

    this.confirmationService.confirm({
      header: '¿Confirmar actualización?',
      message: '¿Estás seguro de que deseas guardar los cambios realizados en tu perfil?',
      accept: () => {
        this.saveProfileChanges();
      }
    });
  }

  private saveProfileChanges(): void {
    const userId = this.user()?.id || this.user()?.idUser;
    if (!userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de identificación',
        detail: 'No se pudo obtener el ID del usuario.',
        life: 4000
      });
      return;
    }

    this.loading.set(true);

    const bodyParams: UserUpdateProfile$Params = {
      body: {
        idUser: userId,
        firstName: this.editProfileForm.value.firstName,
        surName: this.editProfileForm.value.surName,
        email: this.editProfileForm.value.email,
        cellPhone: this.editProfileForm.value.cellPhone,
        image: this.editProfileForm.value.image
      }
    };

    this.api.invoke$Response(userUpdateProfile, bodyParams)
      .then((raw: any) => {
        const res = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;

        if (res?.type === 'success' || !res?.type) {
          const currentStorageUser = JSON.parse(localStorage.getItem('current_user') || '{}');
          const updatedUser = {
            ...currentStorageUser,
            firstName: this.editProfileForm.value.firstName,
            surName: this.editProfileForm.value.surName,
            email: this.editProfileForm.value.email,
            cellPhone: this.editProfileForm.value.cellPhone,
            image: this.editProfileForm.value.image
          };
          localStorage.setItem('current_user', JSON.stringify(updatedUser));

          this.messageService.add({
            severity: 'success',
            summary: 'Perfil actualizado',
            detail: res?.listMessage?.[0] ?? 'Los datos de tu perfil han sido actualizados.',
            life: 4000
          });

          this.usuarioActualizado.emit();
          this.closeModal.emit();
        } else {
          this.messageService.add({
            severity: res.type === 'warning' ? 'warn' : 'error',
            summary: res.type === 'warning' ? 'Advertencia' : 'Error',
            detail: res.listMessage?.[0] ?? 'Ocurrió un inconveniente al actualizar.',
            life: 5000
          });
        }
      })
      .catch(() => {
        this.messageService.add({
          severity: 'error',
          summary: 'Sin conexión',
          detail: 'No se pudo comunicar con el servidor.',
          life: 5000
        });
      })
      .finally(() => {
        this.loading.set(false);
      });
  }
}