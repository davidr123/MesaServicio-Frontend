
import { UserRole } from './ticket.model';

export interface User {
  readonly userId: number;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly fullName: string;
  readonly role: UserRole;
  readonly areaId?: number;
  readonly areaName?: string;
}

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface LoginResponse {
  readonly access_token: string;
  readonly user: User;
}

export interface Area {
  readonly areaId: number;
  readonly areaCode: string;
  readonly areaName: string;
  readonly jefeId: number;
  readonly jefe: User;
  readonly members?: User[];
}
