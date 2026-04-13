import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Area, User } from '../models/user.model';
import { environment } from '../../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AreaServices {

  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/areas`;

  getAllAreas(): Observable<Area[]> {
    return this.http.get<Area[]>(this.apiUrl);
  }

  getAreaById(areaId: number): Observable<Area> {
    return this.http.get<Area>(`${this.apiUrl}/${areaId}`);
  }

  getAreaMembers(areaId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${areaId}/members`);
  }

}
