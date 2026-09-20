import { createFileRoute, Link } from "@tanstack/react-router";
import { projects, type ProjectStatus } from "@/data/projects";
import { awards, education, experience, interests, skills, studentTeams } from "@/data/resume";
import { ChainReactionGame } from "@/components/ChainReactionGame";
import resumeDocument from "@/assets/documents/vince-osorio-resume.docx.asset.json";
import projectPortfolio from "@/assets/documents/vince-osorio-project-portfolio.pdf.asset.json";
import vinceProfile from "@/assets/vince-profile.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vince Christian Osorio's Engineering Portfolio" },
      {
        name: "description",
        content:
          "Portfolio of Vince Christian Osorio, UBC Mechanical Engineering student and UBC Subbots Mechanical Projects Lead.",
      },
      {
        property: "og:title",
        content: "Vince Christian Osorio's Engineering Portfolio",
      },
      {
        property: "og:description",
        content:
          "Mechanical, marine and robotics projects including ROVs, autonomous vehicles, FIRST Robotics, fabrication and engineering analysis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

export const statusStyles: Record<ProjectStatus, string> = {
  completed: "border-border bg-secondary text-foreground",
  ongoing: "border-primary/50 bg-primary/10 text-primary",
  upcoming: "border-muted-foreground/40 bg-muted text-muted-foreground",
};

export const statusLabels: Record<ProjectStatus, string> = {
  completed: "Completed",
  ongoing: "Ongoing",
  upcoming: "Upcoming",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${statusStyles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="technical-label">{eyebrow}</p>

        <h2 className="mt-3 text-4xl font-bold text-starlight sm:text-5xl">{title}</h2>

        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

function Index() {
  return (
    <main className="relative">
      <section className="relative px-6 pb-20 pt-36">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-end gap-10 border-b-2 border-border pb-10 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="animate-rise-in">
              <p className="technical-label">Mechanical Engineering · Naval Architecture and Marine Engineering · UBC</p>
              <h1 className="mt-5 text-6xl font-extrabold uppercase leading-none text-starlight sm:text-7xl lg:text-8xl">
                Vince Christian <span className="text-primary">Osorio</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/80 sm:text-lg">
                Designing marine, robotic and mechanical systems through hands-on prototyping,
                analysis and multidisciplinary project work.
              </p>
            </div>
            <div className="border-l-2 border-primary pl-5 font-mono text-xs uppercase leading-7 text-muted-foreground">
              <p>Discipline: Mechanical Engineering</p>
              <p>Location: Vancouver, BC</p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2" aria-label="Featured project tabs">
            {projects.slice(0, 6).map((project, index) => (
              <Link
                key={project.slug}
                to="/projects/$slug"
                params={{ slug: project.slug }}
                className="project-tab"
              >
                <span className="text-primary">{String(index + 1).padStart(2, "0")}</span>{" "}
                {project.name}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#projects"
              className="border border-primary bg-primary px-6 py-3 font-mono text-xs font-bold uppercase text-primary-foreground transition-colors hover:bg-background hover:text-primary"
            >
              Explore projects
            </a>
            <a
              href="#contact"
              className="border border-border px-6 py-3 font-mono text-xs font-bold uppercase text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Get in touch
            </a>
          </div>

          <div id="game" className="scroll-mt-28 pt-12">
            <ChainReactionGame />
          </div>
        </div>
      </section>

      <Section id="about" eyebrow="01 — Origin" title="About me">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6 text-base font-light leading-relaxed text-foreground/80">
            <p>
              I am a third-year Mechanical Engineering student at the University of British
              Columbia, specializing in Naval Architecture and Marine Engineering. I enjoy turning
              engineering theory into physical systems, especially underwater vehicles, robotics,
              fabrication projects and testable prototypes.
            </p>

            <p>
              My industry experience includes the Site C Clean Energy Project at BC Hydro and the
              New St. Paul's Hospital project with Modern Niagara and Plan Group. Across these
              roles, I have worked with large drawing registers, QA/QC inspections, HVAC
              commissioning, document control and multidisciplinary coordination.
            </p>
          </div>

          <div className="space-y-6 text-base font-light leading-relaxed text-foreground/80">
            <p>
              I currently serve as Mechanical Projects Lead for UBC Subbots, where I guide
              mechanical development for autonomous underwater vehicles, coordinate with electrical
              and software subteams, review CAD and mentor newer members in prototyping,
              manufacturing, waterproofing and the engineering design process.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  k: String(projects.length),
                  v: "Engineering projects",
                },
                {
                  k: "UBC",
                  v: "BASc Mechanical, Naval Architecture and Marine Engineering",
                },
              ].map((s) => (
                <div key={s.v} className="glass-panel p-6">
                  <p className="font-display text-3xl text-primary">{s.k}</p>

                  <p className="mt-2 text-sm text-foreground/70">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section id="projects" eyebrow="02 — The system" title="Projects">
        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((p) => (
            <Link
              key={p.slug}
              to="/projects/$slug"
              params={{
                slug: p.slug,
              }}
              className="machine-panel group overflow-hidden transition-colors duration-300 hover:border-primary"
            >
              {p.cover ? (
                <img
                  src={p.cover}
                  alt={`${p.name} preview`}
                  loading="lazy"
                  className="h-72 w-full bg-background/40 object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                />
              ) : (
                <div className="flex h-72 items-center justify-center bg-background/40 text-xs uppercase tracking-[0.2em] text-foreground/40">
                  Add project photo
                </div>
              )}

              <div className="flex items-start gap-4 p-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-2xl font-bold text-starlight">{p.name}</h3>
                    <StatusBadge status={p.status} />
                  </div>

                  <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-foreground/45">
                    {p.category} · {p.year}
                  </p>

                  <p className="mt-1 text-sm text-primary">{p.tagline}</p>

                  <p className="mt-3 text-sm font-light leading-relaxed text-foreground/70">
                    {p.summary}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section id="resume" eyebrow="03 — Trajectory" title="Skills and Experience">
        <div className="mb-10 flex flex-wrap gap-3">
          <a
            href={resumeDocument.url}
            download
            className="inline-block rounded-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Download resume
          </a>
          <a
            href={projectPortfolio.url}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded-full border border-border px-6 py-3 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            View project portfolio
          </a>
        </div>

        <div className="glass-panel p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Education</p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {education.map((item) => (
              <div key={item.school}>
                <p className="text-lg font-light text-starlight">{item.school}</p>
                <p className="mt-1 text-sm font-light text-foreground/70">{item.detail}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-foreground/45">
                  {item.period}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel mt-10 p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Technical skills</p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {skills.map((group) => (
              <div key={group.group}>
                <p className="text-sm text-starlight">{group.group}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border px-3 py-1 text-[11px] font-light text-foreground/70"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-12 text-[1.2rem] uppercase tracking-[0.2em] text-primary">Experience</p>

        <div className="mt-6 space-y-6">
          {[...experience, ...studentTeams].map((job) => (
            <div key={job.org} className="glass-panel p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="text-2xl font-light text-starlight">{job.org}</h3>

                <p className="text-xs uppercase tracking-[0.2em] text-primary">{job.period}</p>
              </div>

              {job.location && (
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-foreground/45">
                  {job.location}
                </p>
              )}

              <div className="mt-6 space-y-6">
                {job.roles.map((role) => (
                  <div key={role.title + role.period}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-base text-starlight">{role.title}</p>

                      <p className="text-[11px] uppercase tracking-[0.18em] text-foreground/50">
                        {role.period}
                      </p>
                    </div>

                    <ul className="mt-3 space-y-2">
                      {role.bullets.map((b) => (
                        <li
                          key={b}
                          className="relative pl-5 text-sm font-light leading-relaxed text-foreground/75"
                        >
                          <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-primary/70" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid items-start gap-6 md:grid-cols-2">
          <div className="glass-panel p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Awards</p>

            <ul className="mt-6 space-y-2 text-sm font-light text-foreground/75">
              {awards.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>

            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-primary">
              Project portfolio
            </p>
            <p className="mt-4 text-sm font-light leading-relaxed text-foreground/75">
              Additional project background, photos and development notes are available in the
              downloadable portfolio above.
            </p>
          </div>

          <div className="glass-panel p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Interests</p>

            <ul className="mt-4 space-y-2 text-sm font-light text-foreground/75">
              {interests.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="contact" eyebrow="04 — Signal" title="Contact">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Location",
              value: "Vancouver, BC",
              href: undefined,
            },
            {
              label: "Email",
              value: "osoriovince17@gmail.com",
              href: "mailto:osoriovince17@gmail.com",
            },
            {
              label: "LinkedIn",
              value: "linkedin.com/in/vince-osorio",
              href: "https://www.linkedin.com/in/vince-osorio",
            },
          ].map((c) =>
            c.href ? (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="glass-panel group p-6 transition-transform duration-300 hover:-translate-y-1"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-foreground/55">{c.label}</p>

                <p className="mt-3 break-words text-base font-light text-starlight group-hover:text-primary transition-colors">
                  {c.value}
                </p>
              </a>
            ) : (
              <div key={c.label} className="glass-panel p-6">
                <p className="text-xs uppercase tracking-[0.25em] text-foreground/55">{c.label}</p>

                <p className="mt-3 text-base font-light text-starlight">{c.value}</p>
              </div>
            ),
          )}
        </div>
      </Section>

      <footer className="border-t border-border px-6 py-10 text-center font-mono text-xs uppercase text-muted-foreground">
        © {new Date().getFullYear()} Vince Christian Osorio · System nominal
      </footer>
    </main>
  );
}
