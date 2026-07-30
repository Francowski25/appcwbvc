import { Component, inject, output, signal } from '@angular/core';
import {
  AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule,
  ValidationErrors, ValidatorFn, Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { debounceTime, distinctUntilChanged, filter, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Api } from '../../../../api/api';
import { userInsert, UserInsert$Params } from '../../../../api/functions';
import { environment } from '../../../../environments/environments';
import { RadioButtonModule } from 'primeng/radiobutton';

const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass === confirm ? null : { passwordMismatch: true };
};

interface ReniecDniResponse {
  first_name: string;
  first_last_name: string;
  second_last_name: string;
  full_name: string;
  document_number: string;
}

@Component({
  selector: 'app-users-insert',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, InputTextModule,
    ButtonModule, SelectModule, ProgressSpinnerModule, RadioButtonModule
  ],
  templateUrl: './user-insert.html',
  styleUrl: './user-insert.css',
})
export class UsersInsert {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly api = inject(Api);

  usuarioRegistrado = output<void>();
  cerrarDialog = output<void>();

  frmInsertUser: FormGroup;
  isLoading = signal(false);
  isLoadingDni = signal(false);

  selectedFileName = signal('');
  previewUrl = signal<string | null>(null);

  listRoles = [
    { label: 'Químico', value: 'Quimico' },
    { label: 'Vendedor', value: 'Vendedor' }
  ];

  get firstNameFb() { return this.frmInsertUser.controls['firstName']; }
  get surNameFb() { return this.frmInsertUser.controls['surName']; }
  get dniFb() { return this.frmInsertUser.controls['dni']; }
  get cellPhoneFb() { return this.frmInsertUser.controls['cellPhone']; }
  get emailFb() { return this.frmInsertUser.controls['email']; }
  get passwordFb() { return this.frmInsertUser.controls['password']; }
  get confirmPasswordFb() { return this.frmInsertUser.controls['confirmPassword']; }
  get roleFb() { return this.frmInsertUser.controls['role']; }
  get imageFb() { return this.frmInsertUser.controls['image']; }

  constructor() {
    this.frmInsertUser = this.formBuilder.group({
      firstName: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(70)]],
      surName: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(70)]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      cellPhone: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(200)]],
      confirmPassword: ['', [Validators.required]],
      role: ['', [Validators.required]],
      image: ['', [Validators.maxLength(255)]]
    }, { validators: passwordMatchValidator });

    this.listenDniChanges();
  }

  private listenDniChanges(): void {
    this.dniFb.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter((value: string) => {
        if (!value || value.length !== 8) {
          this.firstNameFb.reset();
          this.surNameFb.reset();
          this.firstNameFb.disable();
          this.surNameFb.disable();
        }
        return /^[0-9]{8}$/.test(value);
      }),
      switchMap((dni: string) => {
        this.isLoadingDni.set(true);
        this.firstNameFb.disable();
        this.surNameFb.disable();

        const url = `${environment.urlBase}/api/reniec/${dni}`;
        return this.http.get<ReniecDniResponse>(url).pipe(
          catchError(() => {
            this.firstNameFb.enable();
            this.surNameFb.enable();

            this.messageService.add({
              severity: 'warn',
              summary: 'DNI no encontrado',
              detail: 'No se pudo obtener los datos para ese DNI. Por favor, ingréselos manualmente.',
              life: 4000
            });
            return of(null);
          })
        );
      })
    ).subscribe((res: ReniecDniResponse | null) => {
      this.isLoadingDni.set(false);
      if (!res) return;

      this.firstNameFb.setValue(res.first_name);
      this.surNameFb.setValue(`${res.first_last_name} ${res.second_last_name}`.trim());
      this.firstNameFb.disable();
      this.surNameFb.disable();
    });
  }

  resetForm(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    this.frmInsertUser.reset();
    this.firstNameFb.disable();
    this.surNameFb.disable();
    this.selectedFileName.set('');
    this.previewUrl.set(null);
  }

  closeDialog(): void {
    this.resetForm();
    this.cerrarDialog.emit();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.selectedFileName.set(file.name);
    this.imageFb.setValue(file.name);
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  sendInsertUser(event: Event): void {
    if (!this.frmInsertUser.valid) {
      this.frmInsertUser.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Formulario incompleto',
        detail: 'Complete y corrija todos los campos requeridos.',
        life: 4000
      });
      return;
    }

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Confirmar registro del nuevo usuario?',
      header: 'Confirmación',
      icon: 'pi pi-user-plus',
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Registrar', severity: 'primary' },
      accept: () => {
        this.isLoading.set(true);

        const formValues = this.frmInsertUser.getRawValue();

        const bodyParams: UserInsert$Params = {
          body: {
            firstName: formValues.firstName,
            surName: formValues.surName,
            email: formValues.email,
            password: formValues.password,
            role: formValues.role,
            dni: formValues.dni,
            cellPhone: formValues.cellPhone,
            image: formValues.image || undefined
          }
        };

        this.api.invoke$Response(userInsert, bodyParams).then((raw: any) => {
          const res = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body;
          switch (res.type) {
            case 'success':
              this.messageService.add({ severity: 'success', summary: 'Usuario registrado', detail: res.listMessage[0], life: 4000 });
              this.resetForm();
              this.usuarioRegistrado.emit();
              break;
            case 'warning':
              this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: res.listMessage[0], life: 5000 });
              break;
            case 'error':
              this.messageService.add({ severity: 'error', summary: 'Error', detail: res.listMessage[0], life: 5000 });
              break;
            default:
              this.messageService.add({ severity: 'error', summary: 'Error inesperado', detail: 'Contacte al administrador.', life: 5000 });
          }
        }).catch(() => {
          this.messageService.add({ severity: 'error', summary: 'Sin conexión', detail: 'No se pudo conectar con el servidor.', life: 5000 });
        }).finally(() => {
          this.isLoading.set(false);
        });
      },
      reject: () => { }
    });
  }
}