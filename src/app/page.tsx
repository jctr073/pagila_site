export default function Home() {
  return (
    <main className="flex min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950 sm:px-10 lg:px-16">
      <section className="mx-auto flex w-full max-w-5xl flex-col justify-center gap-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Pagila
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-6xl">
            Next.js, TypeScript, and Postgres are wired up.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">
            The app is ready for server-rendered routes, typed API handlers,
            and a local Docker-backed database named pagila.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Next.js 16", "React 19", "TypeScript 5", "Postgres 18"].map(
            (item) => (
              <div
                className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
                key={item}
              >
                <p className="text-sm font-medium text-zinc-500">Ready</p>
                <p className="mt-2 text-xl font-semibold">{item}</p>
              </div>
            ),
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
            href="/api/health"
          >
            Database health
          </a>
          <a
            className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-100"
            href="https://nextjs.org/docs"
            rel="noreferrer"
            target="_blank"
          >
            Next.js docs
          </a>
        </div>
      </section>
    </main>
  );
}
