export default function ArticlesSection() {
  return (
    <section>
      <h2 className="mb-6 text-3xl font-semibold">Articles & Written Guides</h2>

      <p className="mb-8 text-muted-foreground">
        In-depth written guides are coming soon. These articles will cover
        fightstick builds, part selection, modding techniques, and competitive
        optimization.
      </p>

      <div className="rounded-xl border bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">
          🚧 Articles are currently in progress. Future guides will include:
        </p>

        <ul className="mt-4 list-disc pl-5 text-sm text-muted-foreground space-y-1">
          <li>Beginner’s guide to choosing your first fightstick</li>
          <li>Sanwa vs Seimitsu buttons and levers</li>
          <li>How to mod and maintain your arcade stick</li>
          <li>Optimizing fightsticks for competitive play</li>
        </ul>
      </div>
    </section>
  );
}
