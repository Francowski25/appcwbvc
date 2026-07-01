import { Component, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-sales-detail',
  imports: [DialogModule, DecimalPipe],
  templateUrl: './sales-detail.html',
})
export class SalesDetail {
  visible = input<boolean>(false);
  venta = input<any>(null);
  visibleChange = output<boolean>();
  protected readonly Number = Number;
}