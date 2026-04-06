export function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateString(dateString: string): { year: string; month: string; day: string } {
  const [year, month, day] = dateString.split('-');
  return { year, month, day };
}

export function formatDateLabel(dateString: string): { month: string; day: string; year: string; dayOfWeek: string } {
  const { year, month, day } = parseDateString(dateString);
  return {
    year,
    month: `${parseInt(month)}월`,
    day: `${parseInt(day)}일`,
    dayOfWeek: getDayOfWeek(dateString),
  };
}

export function toPaddedDateString(dateString: string): string {
  const { year, month, day } = parseDateString(dateString);
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function buildDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
