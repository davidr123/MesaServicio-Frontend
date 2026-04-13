
export enum TicketStatus {
  Open = 'Open',
  PendingAssignment = 'PendingAssignment',
  InProgress = 'InProgress',
  OnHold = 'OnHold',
  Closed = 'Closed',
  Reopened = 'Reopened'
}

export enum TicketType {
  Incident = 'Incident',
  Requirement = 'Requirement',
  ChangeRequest = 'ChangeRequest'
}

export enum TicketPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum UserRole {
  Admin = 'Admin',
  Developer = 'Developer',
  User = 'User'
}

export enum CommentType {
  Internal = 'Internal',
  Published = 'Published',
  Question = 'Question'
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
  readonly closedDate: Date | null;
  readonly slaHours: number;
  readonly hoursElapsed: number;
  readonly commentCount: number;
  readonly attachmentCount: number;
}

export interface TicketDetail extends Ticket {
  readonly comments: Comment[];
  readonly timeEntries: TimeEntry[];
  readonly attachments: Attachment[];
}

export interface PagedResult<T> {
  readonly data: readonly T[];
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly totalRecords: number;
  readonly totalPages: number;
}

export interface Comment {
  readonly commentId: number;
  readonly text: string;
  readonly isInternal: boolean;
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
  readonly fileSizeBytes: number;
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
  readonly areaName?: string;
}

export interface AreaBasic {
  readonly areaId: number;
  readonly areaCode: string;
  readonly areaName: string;
}

export interface AddCommentRequest {
  readonly text: string;
  readonly isInternal: boolean;
}

export interface AssignTicketRequest {
  readonly developerId: number;
  readonly priority: string;
}

export interface ReasignRequest {
  readonly newDeveloperId: number;
  readonly justification: string;
}
