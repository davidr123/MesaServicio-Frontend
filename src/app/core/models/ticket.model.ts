
export enum TicketStatus {
  PENDING_ASSIGNMENT = 'PENDING_ASSIGNMENT',
  IN_PROGRESS = 'IN_PROGRESS',
  CERTIFICATION = 'CERTIFICATION',
  CLOSED = 'CLOSED'
}

export enum TicketType {
  INCIDENT = 'INCIDENT',
  CHANGE_REQUEST = 'CHANGE_REQUEST'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER'
}

export enum CommentType {
  QUESTION_TO_USER = 'QUESTION_TO_USER',
  PUBLIC_ACTION = 'PUBLIC_ACTION',
  INTERNAL_ACTION = 'INTERNAL_ACTION'
}

export interface Ticket {
  readonly ticketId: number;
  readonly ticketNumber: string;
  readonly ticketType: TicketType;
  readonly status: TicketStatus;
  readonly priority: TicketPriority;
  readonly title: string;
  readonly description: string;
  readonly customerCedula: string;
  readonly customerFirstName: string;
  readonly customerLastName: string;
  readonly customerEntityNumber: string;
  readonly createdBy: UserBasic;
  readonly assignedTo: UserBasic | null;
  readonly assignedArea: AreaBasic | null;
  readonly createdDate: Date;
  readonly dueDate: Date | null;
  readonly slaHours: number;
  readonly hoursElapsed: number;
  readonly commentCount: number;
  readonly attachmentCount: number;
}

export interface TicketDetail extends Ticket {
  readonly comments: Comment[];
  readonly internalComments: Comment[];
  readonly timeEntries: TimeEntry[];
  readonly attachments: Attachment[];
}

export interface PagedResult<T> {
  readonly items: readonly T[];
  readonly totalCount: number;
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

export interface Comment {
  readonly commentId: number;
  readonly text: string;
  readonly isInternal: boolean;
  readonly commentType: CommentType;
  readonly createdBy: UserBasic;
  readonly createdDate: Date;
}

export interface TimeEntry {
  readonly timeEntryId: number;
  readonly hoursSpent: number;
  readonly taskDescription: string;
  readonly entryDate: Date;
  readonly user: UserBasic;
}

export interface Attachment {
  readonly attachmentId: number;
  readonly fileName: string;
  readonly fileSize: number;
  readonly uploadedDate: Date;
}

export interface CreateIncidentRequest {
  readonly customerCedula: string;
  readonly customerFirstName: string;
  readonly customerLastName: string;
  readonly customerEntityNumber: string;
  readonly description: string;
}

export interface CreateRequirementRequest {
  readonly title: string;
  readonly description: string;
  readonly productName: string;
}

export interface UserBasic {
  readonly userId: number;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly fullName: string;
  readonly role: UserRole;
  readonly areaId?: number;
}

export interface AreaBasic {
  readonly areaId: number;
  readonly areaCode: string;
  readonly areaName: string;
}

export interface ReasignRequest {
  readonly newDeveloperId: number;
  readonly justification: string;
}
