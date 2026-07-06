import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { EditProfile } from './edit-profile/edit-profile';
import { PasswordSettings } from './password-settings/password-settings';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, DialogModule, EditProfile, PasswordSettings],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  user = (() => {
    const raw = localStorage.getItem('current_user');
    return raw ? JSON.parse(raw) : null;
  })();

  showEditProfileDialog = false;
  showPasswordDialog = false;
}