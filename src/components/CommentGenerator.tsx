import { useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, Circle, Loader2 } from 'lucide-react';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

interface CommentGeneratorProps {
  selectedDate: string;
  comments: { text: string, completed: boolean }[];
  onSaveComments: (date: string, comments: string[]) => void;
  onToggleComment: (date: string, index: number) => void;
}

export default function CommentGenerator({ selectedDate, comments, onSaveComments, onToggleComment }: CommentGeneratorProps) {
  const [keyword, setKeyword] = useState('');
  const [weather, setWeather] = useState('');
  const [specialEvent, setSpecialEvent] = useState('');
  const [numStudents, setNumStudents] = useState(() => {
    try {
      const saved = localStorage.getItem('comment-generator-num-students');
      return saved ? parseInt(saved) : 1;
    } catch {
      return 1;
    }
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number | null>(null);

  useEffect(() => {
    setKeyword('');
    setWeather('');
    setSpecialEvent('');
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem('comment-generator-num-students', String(numStudents));
  }, [numStudents]);

  const generateComments = async () => {
    setLoading(true);
    setProgress(0);

    const estimatedTime = Math.max(3000, numStudents * 2000);
    const interval = 50;
    const step = (interval / estimatedTime) * 100;

    progressRef.current = setInterval(() => {
      setProgress(prev => {
        const next = prev + step;
        if (next >= 95) {
          if (progressRef.current) clearInterval(progressRef.current);
          return 95;
        }
        return next;
      });
    }, interval);

    const prompt = `Generate ${numStudents} unique, encouraging, and professional comments for individual elementary school students. 
    Inputs: Keyword: ${keyword}, Weather: ${weather}, Special Event: ${specialEvent}.
    IMPORTANT: Each comment must be addressed to an individual student (e.g., "OO의...or OO이의..."). 
    NEVER use plural or group-addressed terms like "여러분", "모두", "친구들".
    Each comment should be 1-2 sentences, personalized, and distinct from others. 
    Return the comments as a JSON array of strings.`;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Teacher's Comment Craft",
        },
        body: JSON.stringify({
          "model": "qwen/qwen3.6-plus:free",
          "messages": [
            {
              "role": "user",
              "content": prompt,
            },
          ],
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("OpenRouter API error:", result);
        return;
      }
      const content = result.choices?.[0]?.message?.content;
      if (content) {
        const match = content.match(/\[[\s\S]*\]/);
        if (match) {
          try {
            const newComments = JSON.parse(match[0]);
            onSaveComments(selectedDate, newComments);
          } catch (parseError) {
            console.error("Failed to parse comments JSON:", parseError);
          }
        }
      }
    } catch (error) {
      console.error("Error generating comments:", error);
    } finally {
      if (progressRef.current) clearInterval(progressRef.current);
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
    }
  };

  return (
    <main className={`flex-1 p-4 md:p-10 bg-slate-100 bg-dot-pattern overflow-y-auto flex ${comments.length > 0 ? 'items-start' : 'items-center'} justify-center`}>
      <div className="max-w-3xl w-full bg-white p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-xl border border-slate-200 text-lg">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{selectedDate} 코멘트</h1>
          {comments.length > 0 && (
            <button 
              onClick={() => onSaveComments(selectedDate, [])}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition font-medium text-lg"
            >
              <Sparkles size={18} />
              새로 생성하기
            </button>
          )}
        </header>
        
        {comments.length > 0 ? (
          <div className="space-y-3 md:space-y-4">
            {comments.map((comment, index) => (
              <div 
                key={index} 
                onClick={() => onToggleComment(selectedDate, index)}
                className={`flex items-start gap-3 md:gap-4 p-4 md:p-6 rounded-xl md:rounded-2xl border transition cursor-pointer ${comment.completed ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-blue-100 shadow-sm hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5'}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {comment.completed ? <CheckCircle2 className="text-emerald-500" /> : <Circle className="text-slate-300" />}
                </div>
                <span className="text-lg md:text-xl font-bold text-slate-400 w-8">{index + 1}.</span>
                <p className={`text-lg md:text-xl text-slate-800 ${comment.completed ? 'line-through text-slate-500' : ''}`}>
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <input placeholder="키워드 (예: 노력, 성장)" value={keyword} onChange={(e) => setKeyword(e.target.value)} onFocus={(e) => e.target.select()} className="p-3 md:p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg" />
              <input placeholder="날씨 (예: 맑음, 비)" value={weather} onChange={(e) => setWeather(e.target.value)} onFocus={(e) => e.target.select()} className="p-3 md:p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg" />
              <input placeholder="특별한 일 (예: 운동회)" value={specialEvent} onChange={(e) => setSpecialEvent(e.target.value)} onFocus={(e) => e.target.select()} className="p-3 md:p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg" />
              <input type="number" placeholder="인원수" value={numStudents} onChange={(e) => setNumStudents(Math.max(1, parseInt(e.target.value) || 1))} onFocus={(e) => e.target.select()} className="p-3 md:p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg" />
            </div>
            <button 
              onClick={generateComments} 
              disabled={loading}
              className="w-full bg-slate-900 text-white font-bold py-3 md:py-4 rounded-xl hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer text-base md:text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  생성 중...
                </>
              ) : '코멘트 생성하기'}
            </button>
            {loading && (
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
