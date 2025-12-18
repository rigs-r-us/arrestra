'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/src/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
      callbackUrl: '/dashboard',
    });

    setLoading(false);

    if (res?.ok) {
      router.push('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 400, margin: '0 auto' }}>
      <h1>Login to Arrestra</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'grid', gap: 12, marginTop: 16 }}
      >
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm((f) => ({ ...f, email: e.target.value }))
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm((f) => ({ ...f, password: e.target.value }))
          }
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p style={{ marginTop: 12, fontSize: 14 }}>
        Try <strong>admin@demo.com</strong> / <strong>changeme123</strong>
      </p>

      {error && (
        <p style={{ marginTop: 8, color: 'red', fontSize: 14 }}>
          {error}
        </p>
      )}
    </main>
  );
}
