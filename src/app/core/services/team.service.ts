import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../enviroments/enviroment';
import { UserBasic } from '../models/ticket.model';
import { Observable } from 'rxjs';
import { Area } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class TeamServices {
  private http = inject(HttpClient);
  private readonly areasUrl = `${environment.apiUrl}/areas`;

  getTeamMembers(areaId: number): Observable<UserBasic[]> {
    return this.http.get<UserBasic[]>(`${this.areasUrl}/${areaId}/members`);
  }

  getArea(areaId: number): Observable<Area> {
    return this.http.get<Area>(`${this.areasUrl}/${areaId}`);
  }

  getAllAreas(): Observable<Area[]> {
    return this.http.get<Area[]>(this.areasUrl);
  }

  getTeamWorkload(areaId: number): Observable<any> {
    // Endpoint no disponible aún en la API
    return this.http.get(`${this.areasUrl}/${areaId}/workload`);
  }
}
