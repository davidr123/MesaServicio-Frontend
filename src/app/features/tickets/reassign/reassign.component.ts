import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TicketServices } from '../../../core/services/ticket.service';
import { NotificationServices } from '../../../core/services/notification.service';
import { AreaServices } from '../../../core/services/area.service';
import { TeamServices } from '../../../core/services/team.service';
import { AuthServices } from '../../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReasignRequest, TicketDetail, UserBasic } from '../../../core/models/ticket.model';
import { Area } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-reassign',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './reassign.component.html',
  styleUrls: ['./reassign.component.css'],
})
export class ReassignComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketService = inject(TicketServices);
  private teamService = inject(TeamServices);
  private areaService = inject(AreaServices);
  private authService = inject(AuthServices);
  private notificationService = inject(NotificationServices);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  ticket = signal<TicketDetail | null>(null);
  teamMembers = signal<UserBasic[]>([]);
  allAreas = signal<Area[]>([]);
  loading = signal(false);
  submitting = signal(false);
  currentUserArea = signal<number | null>(null);

  form: FormGroup;
  reassignType = signal<'developer' | 'area'>('developer');

  constructor() {
    this.form = this.fb.group({
      selectedDeveloper: ['', Validators.required],
      selectedArea: ['', Validators.required],
      justification: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUserArea.set(user?.areaId || null);
      });

    const ticketId = this.route.snapshot.paramMap.get('id');
    if (ticketId) {
      this.loadTicket(parseInt(ticketId));
      this.loadTeamMembers();
      this.loadAllAreas();
    }
  }

  loadTicket(ticketId: number): void {
    this.loading.set(true);
    this.ticketService.getTicketById(ticketId)
      .pipe(takeUntil(this.destroy$))
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

  loadTeamMembers(): void {
    if (!this.currentUserArea()) return;

    this.teamService.getTeamMembers(this.currentUserArea()!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members: any[]) => {
          // Filtrar el usuario actual
          const currentUser = localStorage.getItem('user');
          const currentUserId = currentUser ? JSON.parse(currentUser).userId : null;
          this.teamMembers.set(
            members.filter(m => m.userId !== currentUserId)
          );
        },
        error: () => {
          this.notificationService.error('Error al cargar miembros del equipo');
        }
      });
  }

  loadAllAreas(): void {
    this.areaService.getAllAreas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (areas: Area[]) => {
          this.allAreas.set(areas);
        },
        error: () => {
          this.notificationService.error('Error al cargar áreas');
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.ticket()) return;

    this.submitting.set(true);

    if (this.reassignType() === 'developer') {
      const request: ReasignRequest = {
        newDeveloperId: this.form.get('selectedDeveloper')?.value,
        justification: this.form.get('justification')?.value
      };

      this.ticketService.reasignToDeveloper(this.ticket()!.ticketId, request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Ticket reasignado exitosamente');
            this.router.navigate(['/tickets', this.ticket()!.ticketId]);
          },
          error: () => {
            this.notificationService.error('Error al reasignar el ticket');
            this.submitting.set(false);
          }
        });
    } else {
      this.ticketService.reasignToArea(
        this.ticket()!.ticketId,
        this.form.get('selectedArea')?.value,
        this.form.get('justification')?.value
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Ticket reasignado a otra área exitosamente');
            this.router.navigate(['/tickets', this.ticket()!.ticketId]);
          },
          error: () => {
            this.notificationService.error('Error al reasignar el ticket');
            this.submitting.set(false);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getDeveloperWorkload(developerId: number): number {
    // Mock - reemplazar con datos reales del API
    const workloads: Record<number, number> = {
      101: 3,
      102: 5,
      103: 2,
      104: 0
    };
    return workloads[developerId] || 0;
  }

  getSLAStatus(developerId: number): string {
    const workload = this.getDeveloperWorkload(developerId);
    if (workload > 5) return 'CRÍTICO';
    if (workload > 3) return 'ALTO';
    return 'OK';
  }

  get justificationError(): string | null {
    const control = this.form.get('justification');
    if (control?.hasError('required')) return 'La justificación es requerida';
    if (control?.hasError('minlength')) return 'Mínimo 10 caracteres';
    return null;
  }

}
