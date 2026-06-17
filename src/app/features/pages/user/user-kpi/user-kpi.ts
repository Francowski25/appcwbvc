import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-kpi',
  imports: [],
  templateUrl: './user-kpi.html',
  styleUrl: './user-kpi.css',
})
export class UserKpi {
  @Input() total: number = 0;
  @Input() activos: number = 0;
  @Input() inactivos: number = 0;
}
