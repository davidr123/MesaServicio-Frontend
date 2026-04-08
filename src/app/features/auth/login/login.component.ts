import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthServices } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { NotificationServices } from '../../../core/services/notification.service';
import { LoginRequest } from '../../../core/models/user.model';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
 private fb = inject(FormBuilder);
  private authService = inject(AuthServices);
  private router = inject(Router);
  private notificationService = inject(NotificationServices);

  form: FormGroup;
  loading = false;

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;

    const request: LoginRequest = {
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value
    };

    this.authService.login(request).subscribe({
      next: () => {
        this.notificationService.success('¡Bienvenido!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.notificationService.error('Email o contraseña incorrectos');
        this.loading = false;
      }
    });
  }

  get emailError(): string | null {
    const control = this.form.get('email');
    if (control?.hasError('required')) return 'El email es requerido';
    if (control?.hasError('email')) return 'Ingrese un email válido';
    return null;
  }

  get passwordError(): string | null {
    const control = this.form.get('password');
    if (control?.hasError('required')) return 'La contraseña es requerida';
    if (control?.hasError('minlength')) return 'Mínimo 6 caracteres';
    return null;
  }
}
