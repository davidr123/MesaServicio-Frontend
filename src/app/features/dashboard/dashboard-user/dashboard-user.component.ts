import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketServices } from '../../../core/services/ticket.service';
import { PagedResult, Ticket, TicketStatus } from '../../../core/models/ticket.model';
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
        this.recentTickets.set(result.data as Ticket[]);
        this.updateStats(result.data as Ticket[]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  updateStats(tickets: Ticket[]): void {
    this.stats.set({
      pending: tickets.filter((t) => t.status === TicketStatus.PendingAssignment).length,
      inProgress: tickets.filter((t) => t.status === TicketStatus.InProgress).length,
      certification: tickets.filter((t) => t.status === TicketStatus.OnHold).length,
      closed: tickets.filter((t) => t.status === TicketStatus.Closed).length
    });
  }

  getPriorityIcon(priority: string): string {
    const icons: Record<string, string> = {
      Critical: 'exclamation-circle text-danger',
      High: 'arrow-up text-warning',
      Medium: 'minus-circle text-info',
      Low: 'check-circle text-success'
    };
    return icons[priority] ?? 'circle text-secondary';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Open: 'Abierto',
      PendingAssignment: 'Pendiente',
      InProgress: 'En Proceso',
      OnHold: 'En Espera',
      Closed: 'Cerrado',
      Reopened: 'Reabierto'
    };
    return labels[status] ?? status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      Open: 'badge-status-pending',
      PendingAssignment: 'badge-status-pending',
      InProgress: 'badge-status-in-progress',
      OnHold: 'badge-status-certification',
      Closed: 'badge-status-closed',
      Reopened: 'badge-status-in-progress'
    };
    return classes[status] ?? '';
  }
}
