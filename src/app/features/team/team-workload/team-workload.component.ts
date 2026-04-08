import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamServices } from '../../../core/services/team.service';
import { AreaServices } from '../../../core/services/area.service';
import { TicketServices } from '../../../core/services/ticket.service';
import { AuthServices } from '../../../core/services/auth.service';
import { NotificationServices } from '../../../core/services/notification.service';
import { UserBasic } from '../../../core/models/ticket.model';
import { Area } from '../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../core/shared/components/loading-spinner/loading-spinner.component';

@Component({
  standalone: true,
  selector: 'app-team-workload',
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './team-workload.component.html',
  styleUrl: './team-workload.component.css',
})
export class TeamWorkloadComponent implements OnInit {

  private teamService = inject(TeamServices);
  private areaService = inject(AreaServices);
  private ticketService = inject(TicketServices);
  private authService = inject(AuthServices);
  private notificationService = inject(NotificationServices);

  members = signal<UserBasic[]>([]);
  allAreas = signal<Area[]>([]);
  loading = signal(false);
  selectedAreaId = signal<number | null>(null);
  ticketStats = signal<Record<number, number>>({});

  ngOnInit(): void {
    this.areaService.getAllAreas().subscribe({
      next: (areas) => {
        this.allAreas.set(areas);
      },
      error: () => {}
    });

    this.authService.getCurrentUser().subscribe((user) => {
      if (user?.areaId) {
        this.selectedAreaId.set(user.areaId);
        this.loadTeamWorkload(user.areaId);
      }
    });
  }

  loadTeamWorkload(areaId: number): void {
    this.loading.set(true);
    this.teamService.getTeamMembers(areaId).subscribe({
      next: (members) => {
        this.members.set(members);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar la carga del equipo');
        this.loading.set(false);
      }
    });
  }

  onAreaChange(event: Event): void {
    const areaId = parseInt((event.target as HTMLSelectElement).value);
    if (areaId) {
      this.selectedAreaId.set(areaId);
      this.loadTeamWorkload(areaId);
    }
  }

  getWorkloadBarWidth(memberId: number): string {
    const count = this.ticketStats()[memberId] ?? 0;
    const maxTickets = 10;
    return `${Math.min((count / maxTickets) * 100, 100)}%`;
  }

  getWorkloadColor(memberId: number): string {
    const count = this.ticketStats()[memberId] ?? 0;
    if (count >= 8) return 'bg-danger';
    if (count >= 5) return 'bg-warning';
    if (count >= 2) return 'bg-info';
    return 'bg-success';
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Admin',
      DEVELOPER: 'Técnico',
      USER: 'Usuario'
    };
    return labels[role] ?? role;
  }
}

