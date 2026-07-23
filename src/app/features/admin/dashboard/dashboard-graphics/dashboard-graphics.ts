import { DecimalPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { UIChart } from 'primeng/chart';

@Component({
  selector: 'app-dashboard-graphics',
  imports: [DecimalPipe, UIChart],
  templateUrl: './dashboard-graphics.html',
  styleUrl: './dashboard-graphics.css',
})

export class DashboardGraphics {
  chartData = input<any>();
  chartOptions = input<any>();
  totalSemana = input<number>(0);
  hasSales = input<boolean>(false);
}