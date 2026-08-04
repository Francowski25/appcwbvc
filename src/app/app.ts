import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from './services/auth.service';

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

export class App implements OnInit {

	private readonly authService = inject(AuthService);

	ngOnInit(): void {
		this.authService.resumeSessionWatcher();
	}

	@HostListener('document:mousemove')
	@HostListener('document:keydown')
	@HostListener('document:click')
	@HostListener('document:scroll')
	onUserActivity(): void {
		this.authService.registerActivity();
	}
}