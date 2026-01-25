import Link from "next/link";

const Footer = () => (
  <footer className="border-t border-[var(--cp-border)] bg-[var(--cp-surface)]/80">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-[var(--cp-secondary)] md:flex-row md:items-center md:justify-between">
      <p>PeacePilot — a calming space to reflect and move forward.</p>
      <div className="flex items-center gap-4">
        <Link href="/problem" className="hover:text-[var(--cp-foreground)]">
          New entry
        </Link>
        <Link href="/journal" className="hover:text-[var(--cp-foreground)]">
          Journal
        </Link>
        <Link href="/settings" className="hover:text-[var(--cp-foreground)]">
          Settings
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;

