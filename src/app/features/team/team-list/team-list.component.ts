import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamServices } from '../../../core/services/team.service';
import { AreaServices } from '../../../core/services/area.service';
import { AuthServices } from '../../../core/services/auth.service';
import { NotificationServices } from '../../../core/services/notification.service';
import { UserBasic } from '../../../core/models/ticket.model';
import { Area } from '../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../core/shared/components/loading-spinner/loading-spinner.component';
import { NoDataComponent } from '../../../core/shared/components/no-data/no-data.component';

@Component({
  standalone: true,
  selector: 'app-team-list',
  imports: [CommonModule, LoadingSpinnerComponent, NoDataComponent],
  templateUrl: './team-list.component.html',
  styleUrl: './team-list.component.css',
})
export class TeamListComponent implements OnInit {

  private teamService = inject(TeamServices);
  private areaService = inject(AreaServices);
  private authService = inject(AuthServices);
  private notificationService = inject(NotificationServices);

  members = signal<UserBasic[]>([]);
  allAreas = signal<Area[]>([]);
  currentArea = signal<Area | null>(null);
  loading = signal(false);
  selectedAreaId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadAreas();
    this.authService.getCurrentUser().subscribe((user) => {
      if (user?.areaId) {
        this.selectedAreaId.set(user.areaId);
        this.loadTeam(user.areaId);
      }
    });
  }

  loadAreas(): void {
    this.areaService.getAllAreas().subscribe({
      next: (areas) => this.allAreas.set(areas),
      error: () => {}
    });
  }

  loadTeam(areaId: number): void {
    this.loading.set(true);
    this.teamService.getTeamMembers(areaId).subscribe({
      next: (members) => {
        this.members.set(members);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar el equipo');
        this.loading.set(false);
      }
    });

    this.teamService.getArea(areaId).subscribe({
      next: (area) => this.currentArea.set(area),
      error: () => {}
    });
  }

  onAreaChange(event: Event): void {
    const areaId = parseInt((event.target as HTMLSelectElement).value);
    if (areaId) {
      this.selectedAreaId.set(areaId);
      this.loadTeam(areaId);
    }
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      ADMIN: 'Admin',
      DEVELOPER: 'Técnico',
      USER: 'Usuario'
    };
    return labels[role] ?? role;
  }

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      ADMIN: 'bg-danger',
      DEVELOPER: 'bg-primary',
      USER: 'bg-secondary'
    };
    return classes[role] ?? 'bg-secondary';
  }
}

