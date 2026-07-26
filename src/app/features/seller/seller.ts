import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { Sidebar } from './layout/sidebar/sidebar';
import { Navbar } from './layout/navbar/navbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Drawer } from '../../shared/components/drawer/drawer';

@Component({
  selector: 'app-seller',
  imports: [
    RouterOutlet,
    Sidebar,
    Navbar,
    ToastModule,
    ConfirmDialogModule,
    Drawer
  ],
  templateUrl: './seller.html',
  styleUrl: './seller.css',
})
export class Seller { }
