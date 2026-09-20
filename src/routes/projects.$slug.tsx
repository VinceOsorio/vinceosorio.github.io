import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getProject, projects } from "@/data/projects";
import { StatusBadge } from "./index";

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Project not found — Vince Osorio" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { project } = loaderData;
    const title = `${project.name} — Vince Osorio`;
    return {
      meta: [
        { title },
        { name: "description", content: project.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: project.summary },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProjectPage,
  notFoundComponent: ProjectNotFound,
});

function ProjectNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <div>
        <h1 className="text-5xl font-bold text-starlight">Drawing not found</h1>
        <p className="mt-4 text-sm text-foreground/70">
          That project isn't in the engineering archive.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-full border border-border px-6 py-3 text-xs uppercase tracking-[0.2em] text-foreground/85 hover:border-primary hover:text-primary"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}

function ProjectPage() {
  const { project } = Route.useLoaderData();
  const others = projects.filter((p) => p.slug !== project.slug);
  const availableImages = project.gallery.filter((image) => image.length > 0);
  const leadImage = availableImages[0] || project.cover;
  const articleImages = availableImages.slice(1);

  return (
    <main className="relative px-4 pb-24 pt-32 sm:px-6 sm:pt-36">
      <article className="mx-auto max-w-5xl">
        <Link to="/" className="nav-link">
          ← Back to projects
        </Link>

        <header className="mt-9 border-b border-border pb-10 sm:mt-12 sm:pb-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h1 className="text-5xl font-light text-starlight sm:text-7xl">{project.name}</h1>
              <p className="mt-4 text-sm uppercase tracking-[0.25em] text-primary sm:text-base">
                {project.tagline}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-10 gap-y-4 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-foreground/45">
                  Project year
                </dt>
                <dd className="mt-1 text-foreground/85">{project.year}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-foreground/45">
                  Status
                </dt>
                <dd className="mt-1">
                  <StatusBadge status={project.status} />
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <section className="grid gap-8 py-12 md:grid-cols-12 md:gap-12 md:py-16">
          <div className="md:col-span-7">
            <p className="technical-label">{project.category}</p>
            <p className="text-xl font-light leading-relaxed text-foreground/90 sm:text-2xl">
              {project.summary}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-foreground/65"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <figure className="md:col-span-5">
            <div className="aspect-[4/3] overflow-hidden rounded-md border border-border bg-card">
              {leadImage ? (
                <img
                  src={leadImage}
                  alt={`${project.name} project detail`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-foreground/40">
                  Add project photo
                </div>
              )}
            </div>
            <figcaption className="mt-3 text-[10px] uppercase tracking-[0.18em] text-foreground/45">
              Project detail · {project.name}
            </figcaption>
          </figure>
        </section>

        <section className="mb-16 grid gap-px border border-border bg-border sm:grid-cols-3">
          {[
            { label: "My role", value: project.role },
            { label: "Engineering focus", value: project.focus },
            { label: "Result", value: project.outcome },
          ].map((item) => (
            <div key={item.label} className="bg-card p-6">
              <p className="technical-label">{item.label}</p>
              <p className="mt-3 text-sm font-light leading-relaxed text-starlight">{item.value}</p>
            </div>
          ))}
        </section>

        <figure className="mb-16 sm:mb-20">
          <div className="overflow-hidden rounded-md border border-border bg-card">
            {project.cover ? (
              <img
                src={project.cover}
                alt={`${project.name} overview`}
                width={1280}
                height={800}
                className="max-h-[76vh] w-full object-contain"
              />
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center text-xs uppercase tracking-[0.2em] text-foreground/40">
                Add cover photo
              </div>
            )}
          </div>
          <figcaption className="mt-3 border-t border-border pt-3 text-[10px] uppercase tracking-[0.18em] text-foreground/45">
            Project overview · {project.year}
          </figcaption>
        </figure>

        <div className="space-y-16 sm:space-y-20">
          {project.body.map((paragraph, index) => {
            const image = articleImages[index];
            const imageFirst = index % 2 === 1;
            return (
              <section
                key={paragraph}
                className={
                  image ? "grid items-start gap-8 md:grid-cols-12 md:gap-12" : "mx-auto max-w-3xl"
                }
              >
                {image && (
                  <figure className={`md:col-span-5 ${imageFirst ? "md:order-1" : "md:order-2"}`}>
                    <div className="overflow-hidden rounded-md border border-border bg-card">
                      <img
                        src={image}
                        alt={`${project.name} detail ${index + 2}`}
                        loading="lazy"
                        width={900}
                        height={900}
                        className="max-h-[62vh] w-full object-contain"
                      />
                    </div>
                    <figcaption className="mt-3 text-[10px] uppercase tracking-[0.18em] text-foreground/45">
                      Figure {String(index + 2).padStart(2, "0")} · {project.name}
                    </figcaption>
                  </figure>
                )}
                <div
                  className={`${image ? `md:col-span-7 ${imageFirst ? "md:order-2" : "md:order-1"}` : ""} border-l-2 border-primary/40 pl-6`}
                >
                  <p className="text-base font-light leading-8 text-foreground/80 sm:text-lg">
                    {paragraph}
                  </p>
                </div>
              </section>
            );
          })}
        </div>

        {articleImages.length > project.body.length && (
          <div className="mt-16 grid gap-5 sm:grid-cols-2">
            {articleImages.slice(project.body.length).map((image, index) => (
              <figure key={`${image}-${index}`}>
                <div className="overflow-hidden rounded-md border border-border bg-card">
                  <img
                    src={image}
                    alt={`${project.name} additional detail ${index + 1}`}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-contain"
                  />
                </div>
              </figure>
            ))}
          </div>
        )}

        <footer className="mt-24 border-t border-border pt-10">
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Other projects</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {others.map((p) => (
              <Link
                key={p.slug}
                to="/projects/$slug"
                params={{ slug: p.slug }}
                className="glass-panel flex items-center gap-3 p-4 transition-transform duration-300 hover:-translate-y-1"
              >
                {p.cover ? (
                  <img
                    src={p.cover}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full border border-border object-cover"
                  />
                ) : (
                  <span className="h-10 w-10 shrink-0 rounded-full border border-border bg-card" />
                )}
                <span className="text-sm font-light text-starlight">{p.name}</span>
              </Link>
            ))}
          </div>
        </footer>
      </article>
    </main>
  );
}
