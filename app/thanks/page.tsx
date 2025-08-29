export const metadata = { title: "Thanks — Arrestra" };

export default function Thanks() {
  return (
    <main className="section">
      <div className="container" style={{maxWidth: 720}}>
        <div className="card">
          <h1 className="text-3xl font-extrabold m-0">Thanks — we got it!</h1>
          <p className="section-sub mt-2">
            We’ll review your request and reach out to schedule a demo. If you need anything sooner,
            email <a href="mailto:intake@arrestra.com" className="underline">intake@arrestra.com</a>.
          </p>
          <a href="/" className="btn btn-outline mt-4">Back to home</a>
        </div>
      </div>
    </main>
  );
}
