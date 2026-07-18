import { Component, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-purchase-detail',
  imports: [DialogModule, DecimalPipe],
  templateUrl: './purchase-detail.html',
})
export class PurchaseDetail {
  compra = input<any>(null);
  visible = input<boolean>(false);
  visibleChange = output<boolean>();

  protected readonly Number = Number;

  getIdCorto(id: string): string {
    return id?.substring(0, 8).toUpperCase() ?? '—';
  }
}