import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import DateSidebar from './components/DateSidebar';
import CommentGenerator from './components/CommentGenerator';
import { CommentHistory, Comment } from './types';
import { getTodayDateString } from './utils/date';

const STORAGE_KEY = 'teachers-comment-craft';
const MAX_DATES = 30;

function migrateCommentIds(data: CommentHistory): CommentHistory {
  const migrated: CommentHistory = {};
  let needsSave = false;

  for (const [date, comments] of Object.entries(data)) {
    migrated[date] = comments.map((c) => {
      if (!c.id) {
        needsSave = true;
        return { ...c, id: crypto.randomUUID() };
      }
      return c;
    });
  }

  if (needsSave) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
  }

  return migrated;
}

function loadFromStorage(): CommentHistory {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? migrateCommentIds(JSON.parse(data)) : {};
  } catch {
    return {};
  }
}

function trimOldestDates(data: CommentHistory): CommentHistory {
  const dates = Object.keys(data);
  if (dates.length <= MAX_DATES) return data;
  const sorted = dates.sort((a, b) => a.localeCompare(b));
  const toRemove = sorted.slice(0, sorted.length - MAX_DATES);
  const trimmed = { ...data };
  toRemove.forEach(d => delete trimmed[d]);
  return trimmed;
}

function createComments(texts: string[]): Comment[] {
  return texts.map((text, index) => ({
    id: crypto.randomUUID(),
    text,
    completed: false,
  }));
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [commentHistory, setCommentHistory] = useState<CommentHistory>(loadFromStorage);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(commentHistory));
  }, [commentHistory]);

  const handleSaveComments = (date: string, comments: string[]) => {
    setCommentHistory(prev => {
      const next = { ...prev, [date]: createComments(comments) };
      return trimOldestDates(next);
    });
  };

  const handleToggleComment = (date: string, commentId: string) => {
    setCommentHistory(prev => {
      const dateComments = [...(prev[date] || [])];
      const index = dateComments.findIndex(c => c.id === commentId);
      if (index === -1) return prev;
      dateComments[index] = { ...dateComments[index], completed: !dateComments[index].completed };
      return { ...prev, [date]: dateComments };
    });
  };

  const handleDeleteComments = (date: string) => {
    setCommentHistory(prev => {
      const next = { ...prev };
      delete next[date];
      return next;
    });
    if (selectedDate === date) {
      setSelectedDate(getTodayDateString());
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-warm-900/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-5 right-5 z-50 w-10 h-10 flex items-center justify-center rounded-xl glass-panel shadow-sm"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5 text-warm-600" />
      </button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 transition-transform duration-300 ease-in-out`}>
        <DateSidebar
          selectedDate={selectedDate}
          onDateChange={(d) => { setSelectedDate(d); setSidebarOpen(false); }}
          dates={Object.keys(commentHistory)}
          onDeleteDate={handleDeleteComments}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <CommentGenerator
          selectedDate={selectedDate}
          comments={commentHistory[selectedDate] || []}
          onSaveComments={handleSaveComments}
          onToggleComment={handleToggleComment}
        />
      </main>
    </div>
  );
}
