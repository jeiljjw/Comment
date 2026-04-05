/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import DateSidebar from './components/DateSidebar';
import CommentGenerator from './components/CommentGenerator';

const STORAGE_KEY = 'teachers-comment-craft';
const MAX_DATES = 30;

function loadFromStorage(): Record<string, {text: string, completed: boolean}[]> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function trimOldestDates(data: Record<string, {text: string, completed: boolean}[]>): Record<string, {text: string, completed: boolean}[]> {
  const dates = Object.keys(data);
  if (dates.length <= MAX_DATES) return data;
  const sorted = dates.sort((a, b) => a.localeCompare(b));
  const toRemove = sorted.slice(0, sorted.length - MAX_DATES);
  const trimmed = { ...data };
  toRemove.forEach(d => delete trimmed[d]);
  return trimmed;
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [commentHistory, setCommentHistory] = useState<Record<string, {text: string, completed: boolean}[]>>(loadFromStorage);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(commentHistory));
  }, [commentHistory]);

  const handleSaveComments = (date: string, comments: string[]) => {
    setCommentHistory(prev => {
      const next = { ...prev, [date]: comments.map(text => ({ text, completed: false })) };
      return trimOldestDates(next);
    });
  };

  const handleToggleComment = (date: string, index: number) => {
    setCommentHistory(prev => {
      const dateComments = [...(prev[date] || [])];
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
      setSelectedDate(new Date().toISOString().split('T')[0]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans bg-dot-pattern">
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>
      
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 transition-transform duration-300 h-full w-80`}>
        <DateSidebar 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
          dates={Object.keys(commentHistory)}
          onDeleteDate={handleDeleteComments}
        />
      </div>
      
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
        />
      )}
      
      <CommentGenerator 
        selectedDate={selectedDate} 
        comments={commentHistory[selectedDate] || []}
        onSaveComments={handleSaveComments}
        onToggleComment={handleToggleComment}
      />
    </div>
  );
}
