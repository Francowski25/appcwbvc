import { Component, input } from '@angular/core';

@Component({
  selector: 'app-user-kpi',
  standalone: true,
  imports: [],
  templateUrl: './user-kpi.html',
  styleUrl: './user-kpi.css',
})
export class UserKpi {
  total = input<number>(0);
  activos = input<number>(0);
  inactivos = input<number>(0);
}
