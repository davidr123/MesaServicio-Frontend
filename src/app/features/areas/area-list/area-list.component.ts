import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaServices } from '../../../core/services/area.service';
import { Area, User } from '../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../core/shared/components/loading-spinner/loading-spinner.component';
import { NoDataComponent } from '../../../core/shared/components/no-data/no-data.component';

@Component({
  standalone: true,
  selector: 'app-area-list',
  imports: [CommonModule, LoadingSpinnerComponent, NoDataComponent],
  templateUrl: './area-list.component.html',
  styleUrls: ['./area-list.component.css'],
})
export class AreaListComponent {
  private areaService = inject(AreaServices);

  areas = signal<Area[]>([]);
  loading = signal(false);
  selectedAreaId = signal<number | null>(null);
  areaMembers = signal<User[]>([]);
  loadingMembers = signal(false);

  ngOnInit(): void {
    this.loadAreas();
  }

  loadAreas(): void {
    this.loading.set(true);
    this.areaService.getAllAreas().subscribe({
      next: (areas) => {
        this.areas.set(areas);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleMembers(areaId: number): void {
    if (this.selectedAreaId() === areaId) {
      this.selectedAreaId.set(null);
      this.areaMembers.set([]);
      return;
    }
    this.selectedAreaId.set(areaId);
    this.loadingMembers.set(true);
    this.areaService.getAreaMembers(areaId).subscribe({
      next: (members) => {
        this.areaMembers.set(members);
        this.loadingMembers.set(false);
      },
      error: () => this.loadingMembers.set(false)
    });
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
