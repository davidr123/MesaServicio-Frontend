import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  registerUser(user: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  getUsersByArea(areaId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/by-area/${areaId}`);
  }

  getTeamMembers(areaId: number): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/areas/${areaId}/members`);
  }
}