import { Component, input, output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-inventory-detail',
  standalone: true,
  imports: [
    DatePipe,
    CurrencyPipe,
    DialogModule
  ],
  templateUrl: './inventory-detail.html',
  styleUrl: './inventory-detail.css',
})
export class InventoryDetail {
  visible = input<boolean>(false);
  visibleChange = output<boolean>();

  detail = input<any>(null);
  loading = input<boolean>(false);
  error = input<string>('');

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  }

  shortenId(id: string): string {
    return id ? id.split('-')[0].toUpperCase() : '';
  }
}