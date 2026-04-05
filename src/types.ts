export interface Comment {
  text: string;
  completed: boolean;
}

export interface CommentHistory {
  [date: string]: Comment[];
}

export interface CommentGeneratorOptions {
  keyword: string;
  weather: string;
  specialEvent: string;
  numStudents: number;
}
