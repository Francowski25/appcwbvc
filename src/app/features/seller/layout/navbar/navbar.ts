import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  layout = inject(LayoutService);

  search = '';
}
