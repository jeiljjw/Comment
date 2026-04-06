import { Sparkles, Loader2, CheckCircle2, Sparkle, SquarePen } from 'lucide-react';
import { useCommentGenerator } from '../hooks/useCommentGenerator';
import { Comment } from '../types';
import { MAX_STUDENTS } from '../config';
import { getDayOfWeek, parseDateString } from '../utils/date';

interface CommentGeneratorProps {
  selectedDate: string;
  comments: Comment[];
  onSaveComments: (date: string, comments: string[]) => void;
  onToggleComment: (date: string, commentId: string) => void;
}

export default function CommentGenerator({ selectedDate, comments, onSaveComments, onToggleComment }: CommentGeneratorProps) {
  const {
    keyword, setKeyword,
    weather, setWeather,
    specialEvent, setSpecialEvent,
    numStudents, setNumStudents,
    loading, progress,
    generateComments,
  } = useCommentGenerator(selectedDate);

  const { year, month, day } = parseDateString(selectedDate);
  const displayMonth = `${parseInt(month, 10)}월`;
  const displayDay = `${parseInt(day, 10)}일`;
  const dayOfWeek = getDayOfWeek(selectedDate);

  const hasComments = comments.length > 0;
  const completedCount = comments.filter(c => c.completed).length;

  return (
    <div className={`h-full overflow-y-auto flex ${hasComments ? 'justify-center' : 'items-center justify-center'} bg-gradient-to-br from-ivory-50 via-warm-100 to-ivory-100 paper-texture bg-dot-pattern relative`}>
      {/* Decorative background elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-coral-300/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-sage-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-amber-200/8 rounded-full blur-2xl pointer-events-none" />

      <div className={`max-w-2xl md:max-w-3xl w-full mx-auto relative z-10 px-6 py-8 md:py-16 ${hasComments ? '' : 'animate-fade-in-up'}`}>
        {/* Date header */}
        <header className="mb-8 md:mb-12">
          <div className="flex items-end gap-3 mb-1">
            <span className="text-xl md:text-2xl font-extrabold text-warm-800 tracking-tight">
              {displayMonth} {displayDay}
            </span>
            <span className="text-sm font-semibold text-coral-500 mb-1">{dayOfWeek}</span>
            <span className="text-sm text-warm-300 mb-1 font-medium ml-1">{year}</span>
          </div>
          <div className="elegant-divider mt-3 mb-4" />
          {hasComments && (
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-warm-400">
                총 <span className="font-semibold text-warm-600">{comments.length}</span>명의 코멘트
                {completedCount > 0 && (
                  <span className="ml-2 text-sage-500">
                    · <span className="font-semibold">{completedCount}</span>명 완료
                  </span>
                )}
              </p>
              <button
                onClick={() => onSaveComments(selectedDate, [])}
                className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-warm-500"
              >
                <Sparkles size={15} />
                새로 생성
              </button>
            </div>
          )}
        </header>

        {hasComments ? (
          /* ===== Comment list ===== */
          <div className="space-y-2 stagger-children pb-20">
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                onClick={() => onToggleComment(selectedDate, comment.id)}
                className={`comment-card group flex items-start gap-4 md:gap-5 p-5 md:p-6 rounded-2xl cursor-pointer border ${comment.completed ? 'comment-completed border-sage-200' : 'bg-white/70 border-warm-200/50 hover:border-warm-200'}`}
              >
                <div className="flex-shrink-0">
                  {comment.completed ? (
                    <CheckCircle2 className="shrink-0 mt-0.5" size={24} style={{ color: '#6BC06B' }} />
                  ) : (
                    <div className="number-badge">
                      {index + 1}
                    </div>
                  )}
                </div>
                <p className={`flex-1 text-base md:text-lg leading-relaxed pt-0.5 ${comment.completed ? 'line-through text-warm-400' : 'text-warm-700'}`}>
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          /* ===== Form ===== */
          <div className="animate-fade-in-up">
            <div className="mb-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-coral-400/20 to-amber-200/30 flex-shrink-0">
                  <SquarePen className="w-5 h-5 text-coral-500" />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-warm-800 tracking-tight">
                  코멘트 만들기
                </h1>
              </div>
              <p className="text-sm text-warm-400 leading-relaxed mt-3">
                학생들에게 따뜻한 마음을 전하세요
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-sm">
              {/* Input rows */}
              <div className="space-y-3 mb-6">
                <InputRow label="키워드" value={keyword} onChange={setKeyword} placeholder="노력, 성장, 배려..." />
                <InputRow label="날씨" value={weather} onChange={setWeather} placeholder="맑음, 비, 추움..." />
                <InputRow label="특별한 일" value={specialEvent} onChange={setSpecialEvent} placeholder="운동회, 소풍, 발표..." />
                <div className="flex flex-row items-center gap-2">
                  <label className="text-xs font-semibold text-warm-700 uppercase tracking-wider w-20 flex-shrink-0">
                    인원수
                  </label>
                  <input
                    type="number"
                    max={MAX_STUDENTS}
                    min={1}
                    value={numStudents}
                    onChange={(e) => setNumStudents(Math.min(MAX_STUDENTS, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                    onFocus={(e) => e.target.select()}
                    className="min-w-0 flex-1 px-3 py-2.5 rounded-xl outline-none text-base text-warm-700 placeholder-warm-300/60 stationery-input"
                  />
                </div>
              </div>

              <div className="elegant-divider mb-6" />

              {/* Generate button */}
              <button
                onClick={() => generateComments(selectedDate, onSaveComments)}
                disabled={loading}
                className="btn-primary w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2.5 relative"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    코멘트 만들고 있어요...
                  </>
                ) : (
                  <>
                    <Sparkle size={16} />
                    코멘트 생성하기
                  </>
                )}
              </button>

              {/* Progress bar */}
              {loading && (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-warm-400 mb-2">
                    <span>생성 중...</span>
                    <span className="font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, #FF8F7B 0%, #FFD9A0 50%, #FFC56C 100%)`,
                        backgroundSize: '400% 100%',
                        animation: 'progressShimmer 2s infinite linear',
                        transition: 'width 30ms linear',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InputRow({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="flex flex-row items-center gap-2">
      <label className="text-xs font-semibold text-warm-700 uppercase tracking-wider w-20 flex-shrink-0">
        {label}
      </label>
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        className="min-w-0 flex-1 px-3 py-2.5 rounded-xl outline-none text-base text-warm-700 placeholder-warm-300/60 stationery-input"
      />
    </div>
  );
}
