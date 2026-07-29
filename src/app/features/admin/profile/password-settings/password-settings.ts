import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { Api } from '../../../../api/api';
import { userUpdatePassword, UserUpdatePassword$Params } from '../../../../api/functions';

@Component({
  selector: 'app-password-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './password-settings.html'
})
export class PasswordSettings {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(Api);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  user = input<any>();

  closeModal = output<void>();
  passwordUpdated = output<void>();

  loading = signal<boolean>(false);

  showCurrentPassword = signal<boolean>(false);
  showNewPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  passwordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
        ]
      ],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: this.passwordMatchValidator }
  );

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  public resetForm(): void {
    this.passwordForm.reset();
    this.resetVisibility();
  }

  resetVisibility(): void {
    this.showCurrentPassword.set(false);
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.passwordForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get newPasswordErrors() {
    return this.passwordForm.get('newPassword')?.errors;
  }

  onCancel(): void {
    this.resetForm();
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Formulario inválido',
        detail: 'Asegúrate de cumplir con los requisitos de la contraseña.',
        life: 4000
      });
      return;
    }

    this.confirmationService.confirm({
      header: '¿Cambiar contraseña?',
      message: '¿Estás seguro de que deseas actualizar tu clave de acceso? Tendrás que usar la nueva contraseña en tu próximo inicio de sesión.',
      accept: () => {
        this.updatePassword();
      }
    });
  }

  private updatePassword(): void {
    const currentUser = this.user();
    const userId = currentUser?.id || currentUser?.idUser;

    if (!userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo identificar al usuario para cambiar la contraseña.',
        life: 4000
      });
      return;
    }

    this.loading.set(true);

    const bodyParams: UserUpdatePassword$Params = {
      body: {
        idUser: userId,
        password: this.passwordForm.get('newPassword')?.value
      }
    };

    this.api.invoke$Response(userUpdatePassword, bodyParams)
      .then((raw: any) => {
        const res = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;

        if (res?.type === 'success' || !res?.type) {
          this.messageService.add({
            severity: 'success',
            summary: 'Contraseña actualizada',
            detail: res?.listMessage?.[0] ?? 'Tu contraseña ha sido modificada con éxito.',
            life: 4000
          });
          this.resetForm();
          this.passwordUpdated.emit();
          this.closeModal.emit();
        } else {
          this.messageService.add({
            severity: res.type === 'warning' ? 'warn' : 'error',
            summary: res.type === 'warning' ? 'Advertencia' : 'Error',
            detail: res.listMessage?.[0] ?? 'No se pudo cambiar la contraseña.',
            life: 5000
          });
        }
      })
      .catch(() => {
        this.messageService.add({
          severity: 'error',
          summary: 'Sin conexión',
          detail: 'No se pudo conectar con el servidor.',
          life: 5000
        });
      })
      .finally(() => {
        this.loading.set(false);
      });
  }
}