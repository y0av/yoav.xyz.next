'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const CanvasGame = dynamic(() => import('@/components/CanvasGame'), { ssr: false });

export default function GuestbookPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const trimmedName = name.trim().slice(0, 60) || 'Anonymous';
      const trimmedMsg = message.trim().slice(0, 1000);
      if (!trimmedMsg) {
        throw new Error('Message cannot be empty');
      }
      await addDoc(collection(db, 'guestbook'), {
        name: trimmedName,
        message: trimmedMsg,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setName('');
      setMessage('');
    } catch (err: any) {
      setError(err?.message || 'Failed to post message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-800">
      {/* Stars-only background */}
      <CanvasGame mode="starsOnly" />

      <main className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-xl rounded-md bg-black/40 backdrop-blur border border-white/10 p-6 text-white">
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded px-3 py-2 bg-black/30 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <textarea
              placeholder="leave a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded px-3 py-2 bg-black/30 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
              >
                {submitting ? 'Posting…' : 'Post'}
              </button>
              {success && <span className="text-green-400 text-sm">Thanks for signing!</span>}
              {error && <span className="text-red-400 text-sm">{error}</span>}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
