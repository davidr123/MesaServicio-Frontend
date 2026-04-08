import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TicketServices } from '../../../core/services/ticket.service';
import { TeamServices } from '../../../core/services/team.service';
import { AuthServices } from '../../../core/services/auth.service';
import { NotificationServices } from '../../../core/services/notification.service';
import { Ticket, PagedResult, TicketStatus } from '../../../core/models/ticket.model';
import { Area } from '../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../core/shared/components/loading-spinner/loading-spinner.component';

@Component({
  standalone: true,
  selector: 'app-dashboard-team',
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './dashboard-team.component.html',
  styleUrl: './dashboard-team.component.css',
})
export class DashboardTeamComponent implements OnInit {

  private ticketService = inject(TicketServices);
  private teamService = inject(TeamServices);
  private authService = inject(AuthServices);
  private notificationService = inject(NotificationServices);

  teamTickets = signal<Ticket[]>([]);
  currentArea = signal<Area | null>(null);
  loading = signal(false);
  stats = signal({
    pending: 0,
    inProgress: 0,
    certification: 0,
    closed: 0
  });

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user?.areaId) {
        this.loadTeamDashboard(user.areaId);
        this.teamService.getArea(user.areaId).subscribe({
          next: (area) => this.currentArea.set(area),
          error: () => {}
        });
      }
    });
  }

  loadTeamDashboard(areaId: number): void {
    this.loading.set(true);
    this.ticketService.getTeamTickets(areaId, 1, 10).subscribe({
      next: (result: PagedResult<Ticket>) => {
        const tickets = result.items as Ticket[];
        this.teamTickets.set(tickets);
        this.stats.set({
          pending: tickets.filter(t => t.status === TicketStatus.PENDING_ASSIGNMENT).length,
          inProgress: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
          certification: tickets.filter(t => t.status === TicketStatus.CERTIFICATION).length,
          closed: tickets.filter(t => t.status === TicketStatus.CLOSED).length
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
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

