'use client';

import { useState } from 'react';

export function useTranscribe() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const transcribe = async (fileId: string) => {
    setIsTranscribing(true);
    setError(null);

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const data = await res.json();
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsTranscribing(false);
    }
  };

  return {
    transcribe,
    isTranscribing,
    error,
  };
}

export function useTranscript(transcriptId: string | null) {
  const [transcript, setTranscript] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTranscript = async () => {
    if (!transcriptId) return null;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/transcribe?id=${transcriptId}`);
      if (!res.ok) throw new Error('Failed to fetch transcript');
      const data = await res.json();
      setTranscript(data);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    transcript,
    isLoading,
    error,
    refetch: fetchTranscript,
  };
}

export function useTranscriptByFileId(fileId: string | null) {
  const [transcript, setTranscript] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTranscript = async () => {
    if (!fileId) return null;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/transcribe?fileId=${fileId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setTranscript(null);
          return null;
        }
        throw new Error('Failed to fetch transcript');
      }
      const data = await res.json();
      setTranscript(data);
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    transcript,
    isLoading,
    error,
    refetch: fetchTranscript,
  };
}

export default useTranscribe;

