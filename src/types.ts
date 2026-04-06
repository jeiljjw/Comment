export interface Comment {
  id: string;
  text: string;
  completed: boolean;
}

export interface CommentHistory {
  [date: string]: Comment[];
}
