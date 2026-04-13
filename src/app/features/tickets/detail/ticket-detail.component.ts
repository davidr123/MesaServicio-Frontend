import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TicketServices } from '../../../core/services/ticket.service';
import { TicketDetail, UserRole, CommentType, TicketStatus } from '../../../core/models/ticket.model';
import { ActivatedRoute } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../core/shared/components/loading-spinner/loading-spinner.component';
import { AuthServices } from '../../../core/services/auth.service';
import { NotificationServices } from '../../../core/services/notification.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-ticket-detail',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css'],
})
export class DetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketServices);
  private authService = inject(AuthServices);
  private notificationService = inject(NotificationServices);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  ticket = signal<TicketDetail | null>(null);
  loading = signal(false);
  commentLoading = signal(false);
  currentUserRole = signal<UserRole | null>(null);
  selectedFile = signal<File | null>(null);
  commentForm: FormGroup;
  showInternalComments = signal(false);

  constructor() {
    this.commentForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(5)]],
      commentType: [CommentType.Published, Validators.required],
      isInternal: [false]
    });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUserRole.set(user?.role as UserRole);
      });

    const ticketId = this.route.snapshot.paramMap.get('id');
    if (ticketId) {
      this.loadTicket(parseInt(ticketId));
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

  onAddComment(): void {
    if (this.commentForm.invalid) return;

    this.commentLoading.set(true);

    const commentType = this.commentForm.get('commentType')?.value as CommentType;
    const isInternal = commentType === CommentType.Internal
      ? true
      : this.commentForm.get('isInternal')?.value;

    const request = {
      text: this.commentForm.get('text')?.value,
      isInternal: isInternal
    };

    // Si hay archivo, usar FormData
    let observable: Observable<any>;

    if (this.selectedFile()) {
      const formData = new FormData();
      formData.append('text', request.text);
      formData.append('isInternal', request.isInternal.toString());
      formData.append('file', this.selectedFile()!);
      observable = this.ticketService.addCommentWithFile(this.ticket()!.ticketId, formData);
    } else {
      observable = this.ticketService.addComment(this.ticket()!.ticketId, request);
    }

    observable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Si es pregunta al usuario, cambiar estado a WAITING_USER_RESPONSE
          if (commentType === CommentType.Question && this.ticket()?.status === TicketStatus.InProgress) {
            this.ticketService.updateTicketStatus(this.ticket()!.ticketId, TicketStatus.OnHold)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.notificationService.success('Comentario enviado y ticket en espera de respuesta del usuario');
                  this.commentForm.reset({ commentType: CommentType.Published });
                  this.selectedFile.set(null);
                  this.commentLoading.set(false);
                  this.loadTicket(this.ticket()!.ticketId);
                },
                error: () => {
                  this.notificationService.success('Comentario agregado (estado podría no haberse actualizado)');
                  this.commentForm.reset({ commentType: CommentType.Published });
                  this.selectedFile.set(null);
                  this.commentLoading.set(false);
                  this.loadTicket(this.ticket()!.ticketId);
                }
              });
          } else {
            this.notificationService.success('Comentario agregado exitosamente');
            this.commentForm.reset({ commentType: CommentType.Published });
            this.selectedFile.set(null);
            this.commentLoading.set(false);
            this.loadTicket(this.ticket()!.ticketId);
          }
        },
        error: () => {
          this.notificationService.error('Error al agregar comentario');
          this.commentLoading.set(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const maxSizeMB = 5;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (file.size > maxSizeBytes) {
        this.notificationService.error(`El archivo no puede exceder ${maxSizeMB} MB`);
        this.selectedFile.set(null);
        target.value = '';
      } else {
        this.selectedFile.set(file);
      }
    }
  }
  canAddComments(): boolean {
    return this.currentUserRole() === UserRole.Admin || this.currentUserRole() === UserRole.Developer;
  }

  canSeeInternalComments(): boolean {
    return this.currentUserRole() === UserRole.Admin || this.currentUserRole() === UserRole.Developer;
  }

  hasAttachments(): boolean {
    return (this.ticket()?.attachmentCount ?? 0) > 0;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getPublicComments() {
    return this.ticket()?.comments?.filter(c => !c.isInternal) ?? [];
  }

  getPriorityIcon(priority: string): string {
    const icons: Record<string, string> = {
      Critical: 'fa-exclamation-circle text-danger',
      High: 'fa-arrow-up text-warning',
      Medium: 'fa-minus-circle text-info',
      Low: 'fa-check-circle text-success'
    };
    return icons[priority] ?? 'fa-circle text-secondary';
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

  getCommentTypeLabel(type: CommentType): string {
    const labels: Record<CommentType, string> = {
      [CommentType.Question]: 'Pregunta al Usuario',
      [CommentType.Published]: 'Acción Publicada',
      [CommentType.Internal]: 'Acción Interna'
    };
    return labels[type] ?? type;
  }

  getCommentTypeBadgeClass(type: CommentType): string {
    const classes: Record<CommentType, string> = {
      [CommentType.Question]: 'bg-info text-white',
      [CommentType.Published]: 'bg-success text-white',
      [CommentType.Internal]: 'bg-warning text-dark'
    };
    return classes[type] ?? 'bg-secondary text-white';
  }

  getInternalComments() {
    return this.ticket()?.comments.filter(c => c.isInternal) || [];
  }

  get commentTextError(): string | null {
    const control = this.commentForm.get('text');
    if (control?.hasError('required')) return 'El comentario es requerido';
    if (control?.hasError('minlength')) return 'Mínimo 5 caracteres';
    return null;
  }
}
