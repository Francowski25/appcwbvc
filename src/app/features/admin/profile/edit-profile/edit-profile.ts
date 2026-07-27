import { Component, inject, input, output, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.html'
})
export class EditProfile implements OnInit {
  private fb = inject(FormBuilder);

  user = input<any>();

  closeModal = output<void>();

  loading = signal<boolean>(false);

  editProfileForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    surName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]]
  });

  constructor() {
    effect(() => {
      this.populateForm();
    });
  }

  ngOnInit(): void {
    this.populateForm();
  }

  private populateForm(): void {
    const currentUser = this.user();
    if (currentUser) {
      this.editProfileForm.patchValue({
        firstName: currentUser.firstName || '',
        surName: currentUser.surName || '',
        email: currentUser.email || ''
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.editProfileForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onCancel(): void {
    this.editProfileForm.reset();
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.editProfileForm.invalid) {
      this.editProfileForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    setTimeout(() => {
      this.loading.set(false);
      this.closeModal.emit();
    }, 800);
  }
}