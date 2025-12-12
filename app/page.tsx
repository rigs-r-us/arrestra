import { auth } from '../src/lib/auth';
import Link from 'next/link';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Arrestra App ✅</h1>
        <p>
          Go to your <Link href="/dashboard">dashboard</Link>.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Arrestra App ✅</h1>
      <p>
        <Link href="/login">Log in</Link> to start reviewing leads.
      </p>
    </main>
  );
}
