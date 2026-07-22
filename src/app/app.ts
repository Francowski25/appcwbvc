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
}