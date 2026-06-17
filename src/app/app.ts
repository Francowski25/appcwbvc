import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		ButtonModule,
		DrawerModule,
		MenuModule,
		AvatarModule,
		ToastModule,
		ConfirmDialogModule
	],
	templateUrl: './app.html',
	styleUrls: ['./app.css']
})
export class App {
	private messageService = inject(MessageService);

	sidebarVisible = signal<boolean>(false);

	navItems: MenuItem[] = [
		{ label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
		{ label: 'Usuarios', icon: 'pi pi-users', routerLink: '/users' },
		{ label: 'Configuración', icon: 'pi pi-cog', routerLink: '/settings' }
	];

	profileItems: MenuItem[] = [
		{ label: 'Mi Perfil', icon: 'pi pi-user' },
		{ label: 'Ajustes', icon: 'pi pi-sliders-h' },
		{ separator: true },
		{ label: 'Cerrar Sesión', icon: 'pi pi-sign-out', command: () => this.logout() }
	];

	toggleSidebar(): void {
		this.sidebarVisible.update(visible => !visible);
	}

	logout(): void {
		this.messageService.add({ severity: 'info', summary: 'Correcto!', detail: 'Sesión cerrada correctamente.', life: 5000 });
	}
}