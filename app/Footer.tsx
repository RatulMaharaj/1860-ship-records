/* eslint-disable @next/next/no-img-element */
export function Footer() {
  return (
    <footer className="mt-12 border-t border-zinc-200/70 bg-[var(--color-cream)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="ui-sans text-[11px] uppercase tracking-widest text-zinc-500 text-center sm:text-left space-y-1">
          <p>
            Indentured Ship Records, 1860–1911 · Data from the{" "}
            <a
              href="https://gldc.ukzn.ac.za/ships-list-1860-1911/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-700 hover:text-[var(--color-primary)] underline-offset-2 hover:underline"
            >
              Gandhi-Luthuli Documentation Centre, UKZN
            </a>
          </p>
          <p>
            Created by{" "}
            <a
              href="https://ratulmaharaj.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-700 hover:text-[var(--color-primary)] underline-offset-2 hover:underline"
            >
              Ratul Maharaj
            </a>
          </p>
        </div>
        <div
          className="flex items-center gap-4"
          aria-label="Voyages between India and South Africa"
        >
          <figure className="flex flex-col items-center gap-1.5">
            <img
              src="/flags/india.svg"
              alt="Flag of India"
              width={48}
              height={32}
              className="block border border-zinc-300 shadow-sm"
            />
            <figcaption className="ui-sans text-[9px] uppercase tracking-widest text-zinc-500">
              India
            </figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-1.5">
            <img
              src="/flags/south-africa.svg"
              alt="Flag of South Africa"
              width={48}
              height={32}
              className="block border border-zinc-300 shadow-sm"
            />
            <figcaption className="ui-sans text-[9px] uppercase tracking-widest text-zinc-500">
              South Africa
            </figcaption>
          </figure>
        </div>
      </div>
    </footer>
  );
}
