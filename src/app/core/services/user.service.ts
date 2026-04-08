import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import { User } from '../models/user.model';

export interface CreateUserRequest {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly password: string;
  readonly areaId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserServices {

  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Users`;

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  registerUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, request);
  }

  getUsersByArea(areaId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/by-area/${areaId}`);
  }

}
