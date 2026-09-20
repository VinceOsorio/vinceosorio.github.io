import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const sections = [
  { id: "about", label: "About me" },
  { id: "projects", label: "Projects" },
  { id: "resume", label: "Skills and Experience" },
  { id: "contact", label: "Contact" },
  { id: "game", label: "Chain Reaction Lab" },
];

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-xl shadow-[0_8px_30px_oklch(0_0_0/45%)]"
          : "border-b border-transparent"
      }`}
    >
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300 ${
          scrolled ? "py-4" : "py-6"
        }`}
      >
        <Link
          to="/"
          className="nav-link mr-6 shrink-0 whitespace-nowrap font-display text-sm tracking-[0.2em] md:mr-10 md:text-base md:tracking-[0.3em]"
        >
          VO / MECH
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="nav-link md:hidden"
          aria-expanded={open}
        >
          Menu
        </button>

        <ul className="hidden items-center gap-8 md:flex">
          <li>
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          {sections.map((s) =>
            onHome ? (
              <li key={s.id}>
                <button type="button" className="nav-link" onClick={() => scrollTo(s.id)}>
                  {s.label}
                </button>
              </li>
            ) : (
              <li key={s.id}>
                <Link to="/" hash={s.id} className="nav-link">
                  {s.label}
                </Link>
              </li>
            ),
          )}
        </ul>
      </nav>

      {open && (
        <ul className="glass-panel mx-6 flex flex-col gap-4 p-6 md:hidden">
          <li>
            <Link to="/" className="nav-link" onClick={() => setOpen(false)}>
              Home
            </Link>
          </li>
          {sections.map((s) => (
            <li key={s.id}>
              {onHome ? (
                <button type="button" className="nav-link" onClick={() => scrollTo(s.id)}>
                  {s.label}
                </button>
              ) : (
                <Link to="/" hash={s.id} className="nav-link" onClick={() => setOpen(false)}>
                  {s.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
