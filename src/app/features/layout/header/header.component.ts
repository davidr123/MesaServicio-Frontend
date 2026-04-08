import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthServices } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { IconComponent } from '../../../core/shared/components/icon/icon.component';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, IconComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
 @Output() toggleSidebar = new EventEmitter<void>();

  private authService = inject(AuthServices);
  private router = inject(Router);

  currentUser: User | null = null;
  dropdownOpen = false;

  constructor() {
    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
    });
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
