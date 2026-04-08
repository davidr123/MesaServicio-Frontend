import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TicketServices } from '../../../core/services/ticket.service';
import { UserServices } from '../../../core/services/user.service';
import { AreaServices } from '../../../core/services/area.service';
import { NotificationServices } from '../../../core/services/notification.service';
import { Ticket, PagedResult, TicketStatus } from '../../../core/models/ticket.model';
import { LoadingSpinnerComponent } from '../../../core/shared/components/loading-spinner/loading-spinner.component';

@Component({
  standalone: true,
  selector: 'app-dashboard-admin',
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css',
})
export class DashboardAdminComponent implements OnInit {

  private ticketService = inject(TicketServices);
  private userService = inject(UserServices);
  private areaService = inject(AreaServices);
  private notificationService = inject(NotificationServices);

  recentTickets = signal<Ticket[]>([]);
  loading = signal(false);
  stats = signal({
    pending: 0,
    inProgress: 0,
    certification: 0,
    closed: 0,
    total: 0
  });
  totalUsers = signal(0);
  totalAreas = signal(0);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);

    this.ticketService.getAllTickets(1, 10).subscribe({
      next: (result: PagedResult<Ticket>) => {
        const tickets = result.items as Ticket[];
        this.recentTickets.set(tickets);
        this.stats.set({
          pending: tickets.filter(t => t.status === TicketStatus.PENDING_ASSIGNMENT).length,
          inProgress: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
          certification: tickets.filter(t => t.status === TicketStatus.CERTIFICATION).length,
          closed: tickets.filter(t => t.status === TicketStatus.CLOSED).length,
          total: result.totalCount
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.userService.getAllUsers().subscribe({
      next: (users) => this.totalUsers.set(users.length),
      error: () => {}
    });

    this.areaService.getAllAreas().subscribe({
      next: (areas) => this.totalAreas.set(areas.length),
      error: () => {}
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING_ASSIGNMENT: 'Pendiente',
      IN_PROGRESS: 'En Proceso',
      CERTIFICATION: 'Certificación',
      CLOSED: 'Cerrado'
    };
    return labels[status] ?? status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING_ASSIGNMENT: 'badge-status-pending',
      IN_PROGRESS: 'badge-status-in-progress',
      CERTIFICATION: 'badge-status-certification',
      CLOSED: 'badge-status-closed'
    };
    return classes[status] ?? '';
  }

  getPriorityIcon(priority: string): string {
    const icons: Record<string, string> = {
      CRITICAL: 'exclamation-circle text-danger',
      HIGH: 'arrow-up text-warning',
      MEDIUM: 'minus-circle text-info',
      LOW: 'check-circle text-success'
    };
    return icons[priority] ?? 'circle text-secondary';
  }
}

