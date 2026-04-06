export function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
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
