import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import {
  BATCH_SIZE,
  DELAY_MS,
  MODEL_NAME,
  MAX_RETRIES,
  RETRY_BASE_DELAY_MS,
  PROGRESS_INCREMENT,
  PROGRESS_INTERVAL_MS,
  PROGRESS_CAP,
  DEFAULT_STUDENTS,
  buildPrompt,
} from '../config';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const STORAGE_KEY_NUM_STUDENTS = 'comment-generator-num-students';
const UNMOUNT_DELAY_MS = 300;

function getAiClient(): GoogleGenAI | null {
  if (!API_KEY) return null;
  return new GoogleGenAI({ apiKey: API_KEY });
}

interface UseCommentGeneratorReturn {
  keyword: string;
  setKeyword: (v: string) => void;
  weather: string;
  setWeather: (v: string) => void;
  specialEvent: string;
  setSpecialEvent: (v: string) => void;
  numStudents: number;
  setNumStudents: (v: number) => void;
  loading: boolean;
  progress: number;
  generateComments: (selectedDate: string, onSaveComments: (date: string, comments: string[]) => void) => Promise<void>;
}

export function useCommentGenerator(selectedDate: string): UseCommentGeneratorReturn {
  const [keyword, setKeyword] = useState('');
  const [weather, setWeather] = useState('');
  const [specialEvent, setSpecialEvent] = useState('');
  const [numStudents, setNumStudents] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NUM_STUDENTS);
      return saved ? parseInt(saved, 10) : DEFAULT_STUDENTS;
    } catch {
      return DEFAULT_STUDENTS;
    }
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(false);
  const abortTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortTimeoutRef.current) clearTimeout(abortTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setKeyword('');
    setWeather('');
    setSpecialEvent('');
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NUM_STUDENTS, String(numStudents));
  }, [numStudents]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const clearProgressInterval = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const generateBatch = useCallback(async (
    count: number,
    keyword: string,
    weather: string,
    specialEvent: string,
  ): Promise<string[]> => {
    const ai = getAiClient();
    if (!ai) {
      console.error('Gemini API key is not configured');
      return [];
    }

    const prompt = buildPrompt({ count, keyword, weather, specialEvent });

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const text = response.text;
        if (text) {
          const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
          const match = cleaned.match(/\[[\s\S]*\]/);
          if (match) {
            try {
              return JSON.parse(match[0]);
            } catch {
              console.error('Failed to parse comments JSON');
            }
          }
        }
        break;
      } catch (error: unknown) {
        const isRateLimit = (error as { status?: number })?.status === 429;
        if (isRateLimit && attempt < MAX_RETRIES - 1) {
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * RETRY_BASE_DELAY_MS));
          continue;
        }
        console.error('Gemini API error:', error);
        break;
      }
    }
    return [];
  }, []);

  const generateComments = useCallback(async (
    selectedDate: string,
    onSaveComments: (date: string, comments: string[]) => void,
  ) => {
    setLoading(true);
    setProgress(0);

    const numBatches = Math.ceil(numStudents / BATCH_SIZE);
    const batches: number[] = [];
    for (let i = 0; i < numBatches; i++) {
      batches.push(Math.min(BATCH_SIZE, numStudents - i * BATCH_SIZE));
    }

    const allComments: string[] = [];
    clearProgressInterval();
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => Math.min(prev + PROGRESS_INCREMENT, PROGRESS_CAP));
    }, PROGRESS_INTERVAL_MS);

    try {
      for (let i = 0; i < batches.length; i++) {
        const result = await generateBatch(batches[i], keyword, weather, specialEvent);
        allComments.push(...result);

        if (i < batches.length - 1) {
          await new Promise(r => setTimeout(r, DELAY_MS));
        }
      }

      clearProgressInterval();
      setProgress(100);

      if (allComments.length > 0) {
        onSaveComments(selectedDate, allComments);
      }
    } catch (error) {
      clearProgressInterval();
      console.error('Error generating comments:', error);
    } finally {
      if (abortTimeoutRef.current) clearTimeout(abortTimeoutRef.current);
      abortTimeoutRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        setLoading(false);
        setProgress(0);
      }, UNMOUNT_DELAY_MS);
    }
  }, [numStudents, keyword, weather, specialEvent, generateBatch, clearProgressInterval]);

  return {
    keyword, setKeyword,
    weather, setWeather,
    specialEvent, setSpecialEvent,
    numStudents, setNumStudents,
    loading, progress,
    generateComments,
  };
}
