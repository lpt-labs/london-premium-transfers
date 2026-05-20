export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-paper text-ink px-pad">
      <p className="mb-6 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-soft">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
        Coming soon
      </p>
      <h1 className="max-w-3xl text-center font-sans text-5xl font-normal leading-none tracking-tight md:text-7xl">
        London Premium{" "}
        <em className="font-serif font-normal italic">Transfers</em>
      </h1>
      <p className="mt-6 max-w-md text-center font-sans text-lg text-ink-soft">
        Executive chauffeur and airport transfers across London and the UK.
      </p>
    </main>
  );
}
