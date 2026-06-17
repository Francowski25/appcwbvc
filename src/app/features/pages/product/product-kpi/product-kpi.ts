import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-kpi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-kpi.html',
  styleUrl: './product-kpi.css'
})
export class ProductKpi {
  total = input<number>(0);
  agotados = input<number>(0);
  porVencer = input<number>(0);
  valor = input<number>(0);

}