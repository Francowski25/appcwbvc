import { Component, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { EditProfile } from './edit-profile/edit-profile';
import { PasswordSettings } from './password-settings/password-settings';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe, DialogModule, EditProfile, PasswordSettings],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  user = signal<any>(this.getUserFromStorage());

  showEditProfileDialog = signal(false);
  showPasswordDialog = signal(false);

  private getUserFromStorage(): any {
    const raw = localStorage.getItem('current_user');
    return raw ? JSON.parse(raw) : null;
  }

  refreshUserData(): void {
    const updatedUser = this.getUserFromStorage();
    this.user.set(updatedUser);
  }
}