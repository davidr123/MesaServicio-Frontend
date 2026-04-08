import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthServices } from '../../../core/services/auth.service';
import { IconComponent } from '../../../core/shared/components/icon/icon.component';


interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: string[];
}

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() isOpen = true;

  private authService = inject(AuthServices);
  currentUserRole: string | null = null;

  navItems: NavItem[] = [
    {
      label: 'Inicio',
      route: '/dashboard',
      icon: 'home',
      roles: ['USER', 'ADMIN', 'DEVELOPER']
    },
    {
      label: 'Mis Tickets',
      route: '/tickets',
      icon: 'list',
      roles: ['USER', 'ADMIN', 'DEVELOPER']
    },
    {
      label: 'Crear Incidente',
      route: '/create-incident',
      icon: 'exclamation-triangle',
      roles: ['USER', 'DEVELOPER']
    },
    {
      label: 'Crear Requerimiento',
      route: '/create-requirement',
      icon: 'clipboard-list',
      roles: ['USER', 'DEVELOPER']
    },
    {
      label: 'Todos los Tickets',
      route: '/all-tickets',
      icon: 'tasks',
      roles: ['ADMIN']
    },
    {
      label: 'Equipo',
      route: '/team',
      icon: 'users',
      roles: ['DEVELOPER', 'ADMIN']
    },
    {
      label: 'Áreas',
      route: '/areas',
      icon: 'building',
      roles: ['ADMIN']
    },
    {
      label: 'Usuarios',
      route: '/users',
      icon: 'user-tie',
      roles: ['ADMIN']
    }
  ];

  constructor() {
    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUserRole = user?.role || null;
    });
  }

  isItemVisible(item: NavItem): boolean {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    return item.roles.includes(this.currentUserRole || '');
  }
}
