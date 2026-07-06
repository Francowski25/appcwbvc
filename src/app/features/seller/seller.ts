import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { Sidebar } from './layout/sidebar/sidebar';
import { Navbar } from './layout/navbar/navbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-seller',
  imports: [
    RouterOutlet,
    Sidebar,
    Navbar,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './seller.html',
  styleUrl: './seller.css',
})
export class Seller { }
