import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationServices {

   private notifications$ = new Subject<Notification>();

  show(notification: Notification): void {
    const id = Math.random().toString(36).substr(2, 9);
    this.notifications$.next({ ...notification, id });

    if (notification.duration !== 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, notification.duration || 3000);
    }
  }

  success(message: string, duration?: number): void {
    this.show({ type: 'success', message, duration, id: '' });
  }

  error(message: string, duration?: number): void {
    this.show({ type: 'error', message, duration, id: '' });
  }

  warning(message: string, duration?: number): void {
    this.show({ type: 'warning', message, duration, id: '' });
  }

  info(message: string, duration?: number): void {
    this.show({ type: 'info', message, duration, id: '' });
  }

  getNotifications(): Observable<Notification> {
    return this.notifications$.asObservable();
  }

  dismiss(id: string): void {
    // Handle dismissal if needed
  }

}
