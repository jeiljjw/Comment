import { Trash2, CalendarDays } from 'lucide-react';

interface DateSidebarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  dates: string[];
  onDeleteDate: (date: string) => void;
}

const getDayOfWeek = (dateString: string) => {
  const date = new Date(dateString);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `(${days[date.getDay()]})`;
};

export default function DateSidebar({ selectedDate, onDateChange, dates, onDeleteDate }: DateSidebarProps) {
  return (
    <aside className="w-80 min-w-80 bg-white border-r border-slate-200 p-6 md:p-8 flex flex-col gap-6 md:gap-8 h-full">
      <div className="flex items-center gap-3">
        <CalendarDays className="text-blue-600" size={28} />
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">날짜 선택</h2>
      </div>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="w-full p-3 md:p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-base md:text-lg"
      />
      <div className="flex flex-col gap-3 flex-1 overflow-hidden">
        <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xl">기록된 날짜 ({dates.length})</h3>
        <div className="space-y-2 overflow-y-auto flex-1">
          {[...dates].sort((a, b) => b.localeCompare(a)).map(date => (
            <div key={date} className="flex items-center gap-2 group">
              <button 
                onClick={() => onDateChange(date)}
                className={`flex-1 p-2 md:p-3 rounded-xl text-left font-medium transition text-xl md:text-2xl ${selectedDate === date ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                {date} <span className="text-xl opacity-70">{getDayOfWeek(date)}</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteDate(date); }}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
