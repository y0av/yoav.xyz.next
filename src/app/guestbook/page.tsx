'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

const CanvasGame = dynamic(() => import('@/components/CanvasGame'), { ssr: false });

export default function GuestbookPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [entries, setEntries] = useState<Array<{ id: string; name: string; message: string; createdAt?: any }>>([]);

  useEffect(() => {
    const q = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: Array<{ id: string; name: string; message: string; createdAt?: any }> = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...(doc.data() as any) }));
      setEntries(list);
    });
    return () => unsub();
  }, []);

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
        <div className="w-full max-w-3xl rounded-md bg-black/40 backdrop-blur border border-white/10 p-6 text-white">
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
          <div className="mt-6 h-px bg-white/10" />
          <div className="mt-6">
            <h2 className="mb-3 text-sm uppercase tracking-wider text-white/70">Guestbook</h2>
            <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scroll">
              {entries.length === 0 && (
                <div className="text-white/60 text-sm">No messages yet. Be the first!</div>
              )}
              <ul className="space-y-3">
                {entries.map((e) => (
                  <li key={e.id} className="rounded border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-blue-300 text-sm font-medium">{e.name || 'Anonymous'}</span>
                      <span className="text-white/50 text-xs">
                        {e.createdAt?.toDate ? new Date(e.createdAt.toDate()).toLocaleString() : ''}
                      </span>
                    </div>
                    <p className="mt-1 text-white/90 whitespace-pre-wrap break-words">{e.message}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
