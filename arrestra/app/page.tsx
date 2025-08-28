export default function Home() {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-2">Welcome to Arrestra</h2>
      <p className="mb-4">This is a minimal Next.js + Prisma starter with mock leads.</p>
      <ol className="list-decimal ml-6 space-y-1">
        <li>Copy <code>.env.example</code> to <code>.env</code>.</li>
        <li>Run <code>npm install</code></li>
        <li>Run <code>npm run prisma:generate && npm run db:push && npm run seed</code></li>
        <li>Run <code>npm run dev</code> and visit <a className="underline" href="/leads">/leads</a>.</li>
      </ol>
    </div>
  );
}
