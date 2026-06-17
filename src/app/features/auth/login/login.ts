import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';

import { Api } from '../../../api/api';
import { auth, Auth$Params } from '../../../api/functions';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email = signal('');
  passwd = signal('');
  remember = signal(false);
  loading = signal(false);
  error = signal('');

  constructor(
    private api: Api,
    private router: Router
  ) { }

  async onSubmit(): Promise<void> {
    if (!this.email() || !this.passwd()) return;

    this.loading.set(true);
    this.error.set('');

    try {
      const params: Auth$Params = {
        body: { email: this.email(), password: this.passwd() }
      };

      const raw = await this.api.invoke$Response(auth, params);
      const response = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw.body as any;

      if (response.type !== 'success') {
        this.error.set(response.listMessage[0] ?? 'Error al iniciar sesión.');
        return;
      }

      localStorage.setItem('current_user', JSON.stringify(response));
      sessionStorage.setItem('loggedIn', 'true');

      const routes: Record<string, string> = {
        'administrador': '/admin',
        'vendedor': '/sales',
        'quimico': '/quimico',
      };

      const route = routes[response.role.toLowerCase().trim()] ?? '/admin';
      this.router.navigate([route]);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}