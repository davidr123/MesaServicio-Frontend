import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TicketServices } from '../../../core/services/ticket.service';
import { AreaServices } from '../../../core/services/area.service';
import { TeamServices } from '../../../core/services/team.service';
import { NotificationServices } from '../../../core/services/notification.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TicketDetail, AssignTicketRequest } from '../../../core/models/ticket.model';
import { Area } from '../../../core/models/user.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../core/shared/components/loading-spinner/loading-spinner.component';

@Component({
  standalone: true,
  selector: 'app-ticket-assign',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './ticket-assign.component.html',
  styleUrls: ['./ticket-assign.component.css'],
})
export class AssignComponent implements OnInit{

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketService = inject(TicketServices);
  private areaService = inject(AreaServices);
  private teamService = inject(TeamServices);
  private notificationService = inject(NotificationServices);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  ticket = signal<TicketDetail | null>(null);
  allAreas = signal<Area[]>([]);
  selectedAreaMembers = signal<any[]>([]);
  loading = signal(false);
  submitting = signal(false);

  form: FormGroup;

  priorityOptions = [
    { value: 'Critical', label: 'CRÍTICA', icon: 'fa-exclamation-circle text-danger' },
    { value: 'High', label: 'ALTA', icon: 'fa-arrow-up text-warning' },
    { value: 'Medium', label: 'MEDIA', icon: 'fa-minus-circle text-info' },
    { value: 'Low', label: 'BAJA', icon: 'fa-check-circle text-success' }
  ];

  constructor() {
    this.form = this.fb.group({
      areaId: ['', Validators.required],
      developerId: ['', Validators.required],
      priority: ['Medium', Validators.required]
    });
  }

  ngOnInit(): void {
    const ticketId = this.route.snapshot.paramMap.get('id');
    if (ticketId) {
      this.loadTicket(parseInt(ticketId));
      this.loadAllAreas();
    }

    // Escuchar cambios en el área seleccionada
    this.form.get('areaId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((areaId) => {
        if (areaId) {
          this.loadAreaMembers(areaId);
          this.form.get('developerId')?.reset();
        }
      });
  }

  loadTicket(ticketId: number): void {
    this.loading.set(true);
    this.ticketService.getTicketById(ticketId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (ticket) => {
          this.ticket.set(ticket);
          this.loading.set(false);
        },
        error: () => {
          this.notificationService.error('Error al cargar el ticket');
          this.loading.set(false);
        }
      });
  }

  loadAllAreas(): void {
    this.areaService.getAllAreas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (areas) => {
          this.allAreas.set(areas);
        },
        error: () => {
          this.notificationService.error('Error al cargar áreas');
        }
      });
  }

  loadAreaMembers(areaId: number): void {
    this.teamService.getTeamMembers(areaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (members) => {
          this.selectedAreaMembers.set(members);
        },
        error: () => {
          this.notificationService.error('Error al cargar miembros del área');
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.ticket()) return;

    this.submitting.set(true);

    const request: AssignTicketRequest = {
      developerId: this.form.get('developerId')?.value,
      priority: this.form.get('priority')?.value
    };

    this.ticketService.assignTicket(this.ticket()!.ticketId, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success('Ticket asignado exitosamente');
          this.router.navigate(['/tickets', this.ticket()!.ticketId]);
        },
        error: () => {
          this.notificationService.error('Error al asignar el ticket');
          this.submitting.set(false);
        }
      });
  }

  getPriorityIcon(priority: string): string {
    const found = this.priorityOptions.find(p => p.value === priority);
    return found ? found.icon : 'fa-circle text-secondary';
  }

  getAreaJefeName(areaId: number): string {
    const area = this.allAreas().find(a => a.areaId === areaId);
    return area ? area.jefe.fullName : '—';
  }

  getMemberWorkload(memberId: number): number {
    // Mock - reemplazar con datos reales del API
    const workloads: Record<number, number> = {
      101: 3,
      102: 5,
      103: 2,
      104: 0
    };
    return workloads[memberId] || 0;
  }

  get selectedAreaName(): string {
    const areaId = this.form.get('areaId')?.value;
    return this.allAreas().find(a => a.areaId == areaId)?.areaName ?? '';
  }

  get selectedDeveloperName(): string {
    const devId = this.form.get('developerId')?.value;
    return this.selectedAreaMembers().find((m: any) => m.userId == devId)?.fullName ?? '';
  }

  get areaError(): string | null {
    const control = this.form.get('areaId');
    if (control?.hasError('required')) return 'Debe seleccionar un área';
    return null;
  }

  get developerError(): string | null {
    const control = this.form.get('developerId');
    if (control?.hasError('required')) return 'Debe seleccionar un desarrollador';
    return null;
  }

  get priorityError(): string | null {
    const control = this.form.get('priority');
    if (control?.hasError('required')) return 'Debe seleccionar una prioridad';
    return null;
  }

}
