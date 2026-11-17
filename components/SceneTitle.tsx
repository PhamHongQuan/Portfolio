export default function SceneTitle({ id, title, intro, center }: { id?: string; title: string; intro?: string; center?: boolean }) {
  return (
    <header className={`mb-10 max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <h2 id={id} className="vf text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.95] tracking-[-0.035em] [--d:76] [--w:740]">
        {title}
      </h2>
      {intro && <p className={`mt-4 max-w-[50ch] text-lg text-muted ${center ? "mx-auto" : ""}`}>{intro}</p>}
    </header>
  );
}
