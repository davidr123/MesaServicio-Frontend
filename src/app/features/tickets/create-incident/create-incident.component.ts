import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketServices } from '../../../core/services/ticket.service';
import { Router } from '@angular/router';
import { NotificationServices } from '../../../core/services/notification.service';
import { CreateIncidentRequest } from '../../../core/models/ticket.model';

@Component({
  standalone: true,
  selector: 'app-create-incident',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-incident.component.html',
  styleUrls: ['./create-incident.component.css'],
})
export class CreateIncidentComponent {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketServices);
  private router = inject(Router);
  private notificationService = inject(NotificationServices);

  form: FormGroup;
  loading = false;

  constructor() {
    this.form = this.fb.group({
      customerCedula: ['', [Validators.required]],
      customerFirstName: ['', [Validators.required]],
      customerLastName: ['', [Validators.required]],
      customerEntityNumber: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;

    const request: CreateIncidentRequest = {
      customerCedula: this.form.get('customerCedula')?.value,
      customerFirstName: this.form.get('customerFirstName')?.value,
      customerLastName: this.form.get('customerLastName')?.value,
      customerEntityNumber: this.form.get('customerEntityNumber')?.value,
      description: this.form.get('description')?.value
    };

    this.ticketService.createIncident(request).subscribe({
      next: (ticket) => {
        this.notificationService.success('Incidente creado exitosamente');
        this.router.navigate(['/tickets', ticket.ticketId]);
      },
      error: () => {
        this.notificationService.error('Error al crear el incidente');
        this.loading = false;
      }
    });
  }

  get cedulaError(): string | null {
    const control = this.form.get('customerCedula');
    if (control?.hasError('required')) return 'La cédula es requerida';
    return null;
  }

  get firstNameError(): string | null {
    const control = this.form.get('customerFirstName');
    if (control?.hasError('required')) return 'El nombre es requerido';
    return null;
  }

  get lastNameError(): string | null {
    const control = this.form.get('customerLastName');
    if (control?.hasError('required')) return 'El apellido es requerido';
    return null;
  }

  get entityNumberError(): string | null {
    const control = this.form.get('customerEntityNumber');
    if (control?.hasError('required')) return 'El número de entidad es requerido';
    return null;
  }

  get descriptionError(): string | null {
    const control = this.form.get('description');
    if (control?.hasError('required')) return 'La descripción es requerida';
    if (control?.hasError('maxlength')) return 'Máximo 500 caracteres';
    return null;
  }
}
