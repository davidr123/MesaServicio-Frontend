import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TicketServices } from '../../../core/services/ticket.service';
import { AuthServices } from '../../../core/services/auth.service';
import { PagedResult, Ticket, TicketStatus } from '../../../core/models/ticket.model';
import { LoadingSpinnerComponent } from '../../../core/shared/components/loading-spinner/loading-spinner.component';
import { NoDataComponent } from '../../../core/shared/components/no-data/no-data.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-ticket-list',
  imports: [CommonModule, FormsModule, RouterModule, LoadingSpinnerComponent, NoDataComponent],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css'],
})
export class TicketListComponent implements OnInit, OnDestroy {
  private ticketService = inject(TicketServices);
  private authService = inject(AuthServices);
  private destroy$ = new Subject<void>();

  tickets = signal<readonly Ticket[]>([]);
  loading = signal(false);
  pageNumber = signal(1);
  pageSize = signal(20);
  totalCount = signal(0);
  selectedStatus = signal<TicketStatus | null>(null);
  searchTerm = signal('');
  isAdmin = signal(false);

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));
  hasNextPage = computed(() => this.pageNumber() < this.totalPages());
  hasPreviousPage = computed(() => this.pageNumber() > 1);

  constructor() {
    effect(() => {
      if (this.pageNumber()) {
        this.loadTickets();
      }
    });

    effect(() => {
      this.ticketService.getTicketRefresh$()
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.pageNumber.set(1);
          this.loadTickets();
        });
    });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.isAdmin.set(user?.role === 'ADMIN');
        this.loadTickets();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTickets(): void {
    this.loading.set(true);

    if (this.isAdmin()) {
      this.ticketService.getAllTickets(
        this.pageNumber(),
        this.pageSize(),
        this.selectedStatus() || undefined
      ).subscribe({
        next: (result: PagedResult<Ticket>) => {
          this.tickets.set(result.items);
          this.totalCount.set(result.totalCount);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.ticketService.getMyTickets(this.pageNumber(), this.pageSize()).subscribe({
        next: (result: PagedResult<Ticket>) => {
          this.tickets.set(result.items);
          this.totalCount.set(result.totalCount);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  applyFilters(): void {
    this.pageNumber.set(1);
    this.loadTickets();
    // Apply search filter locally after loading
    if (this.searchTerm()) {
      setTimeout(() => {
        const term = this.searchTerm().toLowerCase();
        const filtered = this.tickets().filter(t =>
          (t.ticketNumber?.toLowerCase() ?? '').includes(term) ||
          (t.title?.toLowerCase() ?? '').includes(term) ||
          (t.description?.toLowerCase() ?? '').includes(term)
        );
        this.tickets.set(filtered);
      }, 100);
    }
  }

  clearFilters(): void {
    this.selectedStatus.set(null);
    this.searchTerm.set('');
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
  }

  getPriorityIconClass(priority: string): string {
    const icons: Record<string, string> = {
      CRITICAL: 'exclamation-circle text-danger',
      HIGH: 'arrow-up text-warning',
      MEDIUM: 'minus-circle text-info',
      LOW: 'check-circle text-success'
    };
    return icons[priority] ?? 'circle text-secondary';
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

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING_ASSIGNMENT: 'Pendiente',
      IN_PROGRESS: 'En Proceso',
      CERTIFICATION: 'Certificación',
      CLOSED: 'Cerrado'
    };
    return labels[status] ?? status;
  }
}
