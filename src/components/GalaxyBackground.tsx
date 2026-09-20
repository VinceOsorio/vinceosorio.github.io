export function GalaxyBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="blueprint-grid absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-px bg-primary/50" />
      <div className="absolute inset-0 bg-vignette" />
    </div>
  );
}
