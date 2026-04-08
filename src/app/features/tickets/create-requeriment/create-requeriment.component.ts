import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketServices } from '../../../core/services/ticket.service';
import { Router } from '@angular/router';
import { NotificationServices } from '../../../core/services/notification.service';
import { CreateRequirementRequest } from '../../../core/models/ticket.model';

@Component({
  standalone: true,
  selector: 'app-create-requeriment',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-requeriment.component.html',
  styleUrls: ['./create-requeriment.component.css'],
})
export class CreateRequerimentComponent {
 private fb = inject(FormBuilder);
  private ticketService = inject(TicketServices);
  private router = inject(Router);
  private notificationService = inject(NotificationServices);

  form: FormGroup;
  loading = false;

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      productName: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;

    const request: CreateRequirementRequest = {
      title: this.form.get('title')?.value,
      description: this.form.get('description')?.value,
      productName: this.form.get('productName')?.value
    };

    this.ticketService.createRequirement(request).subscribe({
      next: (ticket) => {
        this.notificationService.success('Requerimiento creado exitosamente');
        this.router.navigate(['/tickets', ticket.ticketId]);
      },
      error: () => {
        this.notificationService.error('Error al crear el requerimiento');
        this.loading = false;
      }
    });
  }

  get titleError(): string | null {
    const control = this.form.get('title');
    if (control?.hasError('required')) return 'El título es requerido';
    return null;
  }

  get descriptionError(): string | null {
    const control = this.form.get('description');
    if (control?.hasError('required')) return 'La descripción es requerida';
    if (control?.hasError('maxlength')) return 'Máximo 1000 caracteres';
    return null;
  }

  get productNameError(): string | null {
    const control = this.form.get('productName');
    if (control?.hasError('required')) return 'El nombre del producto es requerido';
    return null;
  }
}
