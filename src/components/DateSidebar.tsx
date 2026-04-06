import { Trash2, ChevronLeft, ChevronRight, BookOpen, Calendar, ChevronDown, CalendarDays } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { getDayOfWeek, formatDateLabel, toPaddedDateString, buildDateString } from '../utils/date';

interface DateSidebarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  dates: string[];
  onDeleteDate: (date: string) => void;
}

export default function DateSidebar({ selectedDate, onDateChange, dates, onDeleteDate }: DateSidebarProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calYear, setCalYear] = useState(() => parseInt(selectedDate.split('-')[0]));
  const [calMonth, setCalMonth] = useState(() => parseInt(selectedDate.split('-')[1]));
  const calendarRef = useRef<HTMLDivElement>(null);

  // Sync calendar state when selectedDate changes externally
  useEffect(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    setCalYear(y);
    setCalMonth(m);
  }, [selectedDate]);

  // Close calendar on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };
    if (calendarOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [calendarOpen]);

  const openCalendar = () => {
    setCalendarOpen(true);
  };

  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth - 1, 1).getDay();
  const today = new Date().toISOString().split('T')[0];
  const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));

  const handleCalendarSelect = useCallback((day: number) => {
    const d = buildDateString(calYear, calMonth, day);
    onDateChange(d);
    setCalendarOpen(false);
  }, [calYear, calMonth, onDateChange]);

  const prevMonth = () => {
    if (calMonth === 1) { setCalYear(y => y - 1); setCalMonth(12); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 12) { setCalYear(y => y + 1); setCalMonth(1); }
    else setCalMonth(m => m + 1);
  };

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];

  // Build calendar rows
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <aside className="w-80 min-w-80 h-screen flex flex-col bg-warm-100/80 border-r border-warm-200/60">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coral-400 to-amber-200 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-warm-800 tracking-tight">Teacher's Comment</h2>
          </div>
        </div>

        {/* Custom date display / picker trigger */}
        <div>
          <label className="block text-xs font-semibold text-warm-400 mb-2 ml-1 uppercase tracking-wider">날짜 선택</label>
          <div
            onClick={openCalendar}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && openCalendar()}
            className="w-full px-4 py-2.5 text-sm bg-white/70 border border-warm-200/60 rounded-xl cursor-pointer flex items-center justify-between text-warm-700 hover:border-coral-300 transition-all"
          >
            <span className="font-medium">
              {toPaddedDateString(selectedDate)}<span className="text-coral-500 font-semibold">({getDayOfWeek(selectedDate)})</span>
            </span>
            <ChevronDown className="w-4 h-4 text-warm-400 flex-shrink-0" />
          </div>
        </div>

        {/* Calendar popup */}
        {calendarOpen && (
          <div ref={calendarRef} className="absolute z-50 mt-2 bg-white rounded-2xl shadow-xl border border-warm-200 p-3 w-72">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-warm-100 transition-colors">
                <ChevronLeft size={18} className="text-warm-600" />
              </button>
              <span className="text-sm font-bold text-warm-800">{calYear}년 {monthNames[calMonth - 1]}</span>
              <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-warm-100 transition-colors">
                <ChevronRight size={18} className="text-warm-600" />
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-0 mb-1">
              {dayLabels.map((d, i) => (
                <div key={i} className={`text-center text-xs font-semibold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-warm-400'}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-0">
                {week.map((day, di) => {
                  if (day === null) return <div key={di} />;
                  const dateStr = buildDateString(calYear, calMonth, day);
                  const isToday = dateStr === today;
                  const isSelected = dateStr === selectedDate;
                  const isSunday = di === 0;
                  const isSaturday = di === 6;

                  let dayColor = 'text-warm-700';
                  if (isSunday) dayColor = 'text-red-400';
                  else if (isSaturday) dayColor = 'text-blue-400';

                  return (
                    <button
                      key={di}
                      onClick={() => handleCalendarSelect(day)}
                      className={`relative text-sm py-1.5 rounded-lg transition-colors font-medium
                        ${isSelected
                          ? 'bg-coral-400 text-white'
                          : isToday
                            ? `bg-coral-50 ${dayColor} border border-coral-200`
                            : `${dayColor} hover:bg-warm-50`
                        }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date list */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <span className="text-xs font-semibold text-warm-400 uppercase tracking-wider">날짜별 보기</span>
          {dates.length > 0 && (
            <span className="text-xs text-warm-400">{sortedDates.length}건</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {sortedDates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-warm-200/60 flex items-center justify-center mb-3">
                <CalendarDays className="w-5 h-5 text-warm-400" />
              </div>
              <p className="text-sm text-warm-400 font-medium">아직 기록이 없어요</p>
              <p className="text-xs text-warm-300 mt-1">코멘트를 생성하면 여기에 표시돼요</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {sortedDates.map((date) => {
                const isActive = date === selectedDate;
                const isToday = date === today;
                const { month, day, dayOfWeek } = formatDateLabel(date);

                return (
                  <div
                    key={date}
                    className={`date-item group flex items-center gap-3 cursor-pointer rounded-xl ${isActive ? 'active' : ''}`}
                    onClick={() => onDateChange(date)}
                  >
                    {/* Calendar-style date badge */}
                    <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 transition-all ${isActive ? 'bg-gradient-to-br from-coral-400/90 to-amber-200/80 text-white shadow-sm' : 'bg-white/70 text-warm-600 border border-warm-200/50 group-hover:bg-white group-hover:border-warm-300/60'}`}>
                      <span className="text-sm font-medium leading-none opacity-70">{month.replace('월', '')}</span>
                      <span className="text-base font-bold leading-tight">{parseInt(day)}</span>
                    </div>

                    {/* Date info */}
                    <div className="flex-1 min-w-0">
                      {isToday ? (
                        <span className="text-base font-semibold text-warm-700">오늘</span>
                      ) : (
                        <span className="text-base font-medium text-warm-700">{month} {day}</span>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-semibold ${isActive ? 'text-coral-500' : 'text-sage-500'}`}>{dayOfWeek}</span>
                        <span className="text-sm text-warm-300">·</span>
                        <span className="text-sm text-warm-300">{date}</span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteDate(date); }}
                      className="p-1.5 rounded-lg text-warm-300 hover:text-red-400 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                      aria-label="Delete date"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
