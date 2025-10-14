'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const onSubmit = async (e: React.FormEvent) => { e.preventDefault(); await signIn('credentials', { email, password, callbackUrl: '/dashboard' }); };
  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="input" type="email" placeholder="you@firm.com" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn" type="submit">Sign in</button>
      </form>
      <p className="text-xs text-slate-500 mt-3">Dev: use credentials from seed.</p>
    </div>
  );
}
