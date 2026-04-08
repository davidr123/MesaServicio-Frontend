import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserServices, CreateUserRequest } from '../../../../core/services/user.service';
import { AreaServices } from '../../../../core/services/area.service';
import { NotificationServices } from '../../../../core/services/notification.service';
import { User, Area } from '../../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../../core/shared/components/loading-spinner/loading-spinner.component';
import { NoDataComponent } from '../../../../core/shared/components/no-data/no-data.component';

@Component({
  standalone: true,
  selector: 'app-user-list',
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, NoDataComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent implements OnInit {

  private userService = inject(UserServices);
  private areaService = inject(AreaServices);
  private notificationService = inject(NotificationServices);
  private fb = inject(FormBuilder);

  users = signal<User[]>([]);
  areas = signal<Area[]>([]);
  loading = signal(false);
  showForm = signal(false);
  submitting = signal(false);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      areaId: [null]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadAreas();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar los usuarios');
        this.loading.set(false);
      }
    });
  }

  loadAreas(): void {
    this.areaService.getAllAreas().subscribe({
      next: (areas) => this.areas.set(areas),
      error: () => {}
    });
  }

  toggleForm(): void {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.form.reset();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);

    const request: CreateUserRequest = {
      firstName: this.form.get('firstName')?.value,
      lastName: this.form.get('lastName')?.value,
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value,
      areaId: this.form.get('areaId')?.value || undefined
    };

    this.userService.registerUser(request).subscribe({
      next: () => {
        this.notificationService.success('Usuario creado exitosamente');
        this.form.reset();
        this.showForm.set(false);
        this.loadUsers();
        this.submitting.set(false);
      },
      error: () => {
        this.notificationService.error('Error al crear el usuario');
        this.submitting.set(false);
      }
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

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      ADMIN: 'bg-danger',
      DEVELOPER: 'bg-primary',
      USER: 'bg-secondary'
    };
    return classes[role] ?? 'bg-secondary';
  }

  getAreaName(areaId?: number): string {
    if (!areaId) return '—';
    return this.areas().find(a => a.areaId === areaId)?.areaName ?? '—';
  }

  get firstNameError(): string | null {
    const c = this.form.get('firstName');
    return c?.hasError('required') ? 'El nombre es requerido' : null;
  }

  get lastNameError(): string | null {
    const c = this.form.get('lastName');
    return c?.hasError('required') ? 'El apellido es requerido' : null;
  }

  get emailError(): string | null {
    const c = this.form.get('email');
    if (c?.hasError('required')) return 'El email es requerido';
    if (c?.hasError('email')) return 'Ingrese un email válido';
    return null;
  }

  get passwordError(): string | null {
    const c = this.form.get('password');
    if (c?.hasError('required')) return 'La contraseña es requerida';
    if (c?.hasError('minlength')) return 'Mínimo 6 caracteres';
    return null;
  }
}

