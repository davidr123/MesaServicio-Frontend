import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  registerUser(user: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, user);
  }

  getUsersByArea(areaId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/area/${areaId}`);
  }
}