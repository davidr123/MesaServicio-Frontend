import { CommentType } from './ticket.model';

export interface AddCommentRequest {
  readonly text: string;
  readonly isInternal: boolean;
  readonly commentType: CommentType;
}
