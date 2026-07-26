import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { LayoutService } from '../../../services/layout.service';
import { DrawerMessages } from './drawer-messages/drawer-messages';
import { DrawerNotifications } from './drawer-notifications/drawer-notifications';
import { DrawerSettings } from './drawer-settings/drawer-settings';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [
    CommonModule,
    DrawerModule,
    DrawerMessages,
    DrawerNotifications,
    DrawerSettings
  ],
  templateUrl: './drawer.html',
  styleUrls: ['./drawer.css']
})
export class Drawer {
  public layout = inject(LayoutService);

  get isVisible(): boolean {
    return this.layout.activeDrawer() !== null;
  }

  set isVisible(val: boolean) {
    if (!val) {
      this.layout.closeDrawer();
    }
  }
}