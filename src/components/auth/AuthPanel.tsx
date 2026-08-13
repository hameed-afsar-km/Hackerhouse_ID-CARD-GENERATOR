'use client';

import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import { getClientAuth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/Button';
import { Globe, Loader2, Lock, LogIn, Mail, UserPlus } from 'lucide-react';

interface AuthPanelProps {
  onAuthed: (user: User) => void;
}

export const AuthPanel: React.FC<AuthPanelProps> = ({ onAuthed }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'google' | 'email' | null>(null);

  const handleGoogle = async () => {
    setBusy('google');
    setError(null);
    try {
      const result = await signInWithPopup(getClientAuth(), new GoogleAuthProvider());
      onAuthed(result.user);
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setBusy(null);
    }
  };

  const handleEmail = async () => {
    const trimmed = email.trim();
    if (!trimmed || password.length < 6) {
      setError('Enter a valid email and a password of at least 6 characters.');
      return;
    }
    setBusy('email');
    setError(null);
    try {
      const result =
        mode === 'signup'
          ? await createUserWithEmailAndPassword(getClientAuth(), trimmed, password)
          : await signInWithEmailAndPassword(getClientAuth(), trimmed, password);
      onAuthed(result.user);
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') setError('An account already exists with this email. Switch to Log In.');
      else if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password')
        setError('Incorrect email or password.');
      else if (code === 'auth/weak-password') setError('Password is too weak — use at least 6 characters.');
      else if (code === 'auth/invalid-email') setError('That email address looks invalid.');
      else if (code === 'auth/too-many-requests') setError('Too many attempts. Please wait a moment and retry.');
      else setError('Sign-in failed. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="hh-card p-6 space-y-5 font-sans">
      <div className="text-center space-y-1">
        <div className="font-mono text-[10px] font-bold text-pink uppercase tracking-wider">One Builder ID per account</div>
        <p className="font-sans text-sm font-bold text-ink uppercase tracking-wider">
          SIGN IN TO MINT YOUR ID
        </p>
      </div>

      <Button variant="outline" size="lg" onClick={handleGoogle} disabled={busy !== null} className="w-full border-2 border-ink text-ink">
        {busy === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
        CONTINUE WITH GOOGLE
      </Button>

      <div className="flex items-center gap-3 font-mono text-[10px] font-bold text-ink/40 uppercase">
        <div className="h-px flex-1 bg-ink/10" /> or <div className="h-px flex-1 bg-ink/10" />
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-cream/60 border-2 border-ink/15 focus:border-pink text-ink px-11 py-3 font-mono text-sm font-bold rounded-xl outline-none transition-all placeholder:text-ink/40"
          />
        </div>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEmail();
            }}
            className="w-full bg-cream/60 border-2 border-ink/15 focus:border-pink text-ink px-11 py-3 font-mono text-sm font-bold rounded-xl outline-none transition-all placeholder:text-ink/40"
          />
        </div>

        {error && <p className="font-mono text-[11px] font-bold text-pink bg-pink/10 rounded-xl px-3 py-2">{error}</p>}

        <Button variant="primary" size="lg" onClick={handleEmail} disabled={busy !== null} className="w-full pink-pill-btn">
          {busy === 'email' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : mode === 'signup' ? (
            <UserPlus className="w-4 h-4" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {mode === 'signup' ? 'CREATE ACCOUNT & MINT ID' : 'LOG IN & MINT ID'}
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        className="w-full font-mono text-[11px] font-bold text-sea-green hover:text-pink transition-colors"
      >
        {mode === 'login' ? "NEW HERE? CREATE AN ACCOUNT" : "ALREADY HAVE AN ACCOUNT? LOG IN"}
      </button>
    </div>
  );
};
