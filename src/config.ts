export const BATCH_SIZE = 30;
export const DELAY_MS = 5000;
export const MODEL_NAME = 'gemini-3-flash-preview';
export const MAX_RETRIES = 3;
export const RETRY_BASE_DELAY_MS = 3000;
export const PROGRESS_INCREMENT = 0.4;
export const PROGRESS_INTERVAL_MS = 100;
export const PROGRESS_CAP = 95;
export const MAX_STUDENTS = 30;
export const DEFAULT_STUDENTS = 10;

export function buildPrompt(options: {
  count: number;
  keyword: string;
  weather: string;
  specialEvent: string;
}): string {
  return `Generate ${options.count} unique Korean elementary school report card comments.
    Keyword: ${options.keyword}, Weather: ${options.weather}, Event: ${options.specialEvent}.
    Rules:
    - Exactly 2 sentences per comment.
    - Use "OO" to refer to each student (e.g., "OO는", "OO이").
    - Subtly weave the keyword into each comment naturally.
    - Encouraging, warm tone, each comment must be distinct.
    - NO plural terms ("여러분", "모두", "친구들").
    - Return JSON array of strings only. No extra text.`;
}
