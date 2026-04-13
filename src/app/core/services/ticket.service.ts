import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../enviroments/enviroment';
import { Observable, shareReplay, Subject, tap } from 'rxjs';
import { CreateIncidentRequest, CreateRequirementRequest, PagedResult, ReasignRequest, Ticket, TicketDetail, TicketStatus, AddCommentRequest, AssignTicketRequest } from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketServices {

  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tickets`;
  private ticketRefresh$ = new Subject<void>();

  getTicketRefresh$(): Observable<void> {
    return this.ticketRefresh$.asObservable();
  }

  getMyTickets(
    pageNumber: number = 1,
    pageSize: number = 20
  ): Observable<PagedResult<Ticket>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PagedResult<Ticket>>(`${this.apiUrl}/my`, { params });
  }

  getAllTickets(
    pageNumber: number = 1,
    pageSize: number = 20,
    status?: TicketStatus,
    areaId?: number
  ): Observable<PagedResult<Ticket>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (status) params = params.set('status', status);
    if (areaId) params = params.set('areaId', areaId.toString());

    return this.http.get<PagedResult<Ticket>>(this.apiUrl, { params });
  }

  getTeamTickets(
    areaId: number,
    pageNumber: number = 1,
    pageSize: number = 20
  ): Observable<PagedResult<Ticket>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PagedResult<Ticket>>(`${this.apiUrl}/by-area/${areaId}`, { params });
  }

  getTicketById(id: number): Observable<TicketDetail> {
    return this.http.get<TicketDetail>(`${this.apiUrl}/${id}`);
  }

  createIncident(request: CreateIncidentRequest): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/incident`, request).pipe(
      tap(() => this.ticketRefresh$.next()),
      shareReplay(1)
    );
  }

  createRequirement(request: CreateRequirementRequest): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/requirement`, request).pipe(
      tap(() => this.ticketRefresh$.next()),
      shareReplay(1)
    );
  }

  assignTicket(
    ticketId: number,
    request: AssignTicketRequest
  ): Observable<Ticket> {
    return this.http
      .put<Ticket>(`${this.apiUrl}/${ticketId}/assign`, request)
      .pipe(
        tap(() => this.ticketRefresh$.next()),
        shareReplay(1)
      );
  }

  reasignToDeveloper(ticketId: number, request: ReasignRequest): Observable<Ticket> {
    return this.http
      .post<Ticket>(`${this.apiUrl}/${ticketId}/reassign-developer`, request)
      .pipe(
        tap(() => this.ticketRefresh$.next()),
        shareReplay(1)
      );
  }

  reasignToArea(
    ticketId: number,
    areaId: number,
    justification?: string
  ): Observable<Ticket> {
    return this.http
      .post<Ticket>(`${this.apiUrl}/${ticketId}/reassign-area`, {
        areaId,
        justification
      })
      .pipe(
        tap(() => this.ticketRefresh$.next()),
        shareReplay(1)
      );
  }

  addComment(ticketId: number, request: AddCommentRequest): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/${ticketId}/comments`, request)
      .pipe(
        tap(() => this.ticketRefresh$.next()),
        shareReplay(1)
      );
  }

  addCommentWithFile(ticketId: number, formData: FormData): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/${ticketId}/comments-with-file`, formData)
      .pipe(
        tap(() => this.ticketRefresh$.next()),
        shareReplay(1)
      );
  }

  addTimeEntry(
    ticketId: number,
    hoursSpent: number,
    taskDescription: string
  ): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/${ticketId}/time-entry`, {
        hoursSpent,
        taskDescription
      })
      .pipe(
        tap(() => this.ticketRefresh$.next()),
        shareReplay(1)
      );
  }

  closeTicket(ticketId: number, solutionDescription: string): Observable<Ticket> {
    return this.http
      .put<Ticket>(`${this.apiUrl}/${ticketId}/close`, solutionDescription)
      .pipe(
        tap(() => this.ticketRefresh$.next()),
        shareReplay(1)
      );
  }

  updateTicketStatus(ticketId: number, status: TicketStatus): Observable<Ticket> {
    return this.http
      .put<Ticket>(`${this.apiUrl}/${ticketId}/status`, { status })
      .pipe(
        tap(() => this.ticketRefresh$.next()),
        shareReplay(1)
      );
  }

  refreshTickets(): void {
    this.ticketRefresh$.next();
  }

}
