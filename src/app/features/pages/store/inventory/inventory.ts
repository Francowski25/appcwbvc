import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-inventory',
  imports: [
    CardModule,
    ButtonModule
  ],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory { }
