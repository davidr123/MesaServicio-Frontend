import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketServices } from '../../../core/services/ticket.service';
import { PagedResult, Ticket } from '../../../core/models/ticket.model';
import { LoadingSpinnerComponent } from '../../../core/shared/components/loading-spinner/loading-spinner.component';
import { NoDataComponent } from '../../../core/shared/components/no-data/no-data.component';

@Component({
  standalone: true,
  selector: 'app-dashboard-user-component',
  imports: [CommonModule, LoadingSpinnerComponent, NoDataComponent],
  templateUrl: './dashboard-user.component.html',
  styleUrls: ['./dashboard-user.component.css'],
})
export class DashboardUserComponent {
 private ticketService = inject(TicketServices);

  recentTickets = signal<Ticket[]>([]);
  loading = signal(false);
  stats = signal({
    pending: 0,
    inProgress: 0,
    certification: 0,
    closed: 0
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.ticketService.getMyTickets(1, 10).subscribe({
      next: (result: PagedResult<Ticket>) => {
        this.recentTickets.set(result.items as Ticket[]);
        this.updateStats(result.items as Ticket[]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  updateStats(tickets: Ticket[]): void {
    this.stats.set({
      pending: tickets.filter((t) => t.status === 'PENDING_ASSIGNMENT').length,
      inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
      certification: tickets.filter((t) => t.status === 'CERTIFICATION').length,
      closed: tickets.filter((t) => t.status === 'CLOSED').length
    });
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
}
