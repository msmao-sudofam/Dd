export default function Home() {
  const features = [
    {
      icon: "⚡",
      title: "One-Command Setup",
      description:
        "Get Claude Code configured and ready in seconds. No manual config files, no guesswork.",
      delay: "delay-100",
    },
    {
      icon: "🔧",
      title: "Smart Defaults",
      description:
        "Sensible defaults for hooks, permissions, and MCP servers — tuned for real-world workflows.",
      delay: "delay-200",
    },
    {
      icon: "🧩",
      title: "Project Templates",
      description:
        "Kickstart any project with pre-built Claude configurations for Next.js, Python, Rust, and more.",
      delay: "delay-300",
    },
    {
      icon: "🔒",
      title: "Secure by Default",
      description:
        "Least-privilege permission settings out of the box. You decide what Claude can touch.",
      delay: "delay-400",
    },
  ];

  const steps = [
    { step: "01", label: "Install", detail: "npx setup-claude", delay: "delay-100" },
    { step: "02", label: "Choose a template", detail: "Next.js · Python · Rust · Blank", delay: "delay-300" },
    { step: "03", label: "Start building", detail: "Claude is ready. Open your editor.", delay: "delay-500" },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      {/* Nav */}
      <nav className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto animate-fade-in">
        <span className="font-semibold text-lg tracking-tight animate-float">setup-claude</span>
        <a
          href="https://docs.anthropic.com/en/docs/claude-code/overview"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          Docs →
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <span className="animate-fade-up delay-100 inline-block text-xs font-medium tracking-widest uppercase text-orange-500 mb-4">
          Claude Code · Setup Tool
        </span>
        <h1 className="animate-fade-up delay-200 text-5xl font-bold tracking-tight leading-tight mb-6">
          The fastest way to set up{" "}
          <span className="animate-shimmer-text">Claude Code</span>
        </h1>
        <p className="animate-fade-up delay-300 text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          setup-claude configures Claude Code for your project in one command — hooks, permissions,
          MCP servers, and project templates included.
        </p>
        <div className="animate-fade-up delay-400 flex items-center justify-center gap-4 flex-wrap">
          <div className="animate-glow-pulse bg-zinc-900 text-white rounded-lg px-5 py-3 font-mono text-sm">
            <span className="animate-typing inline-block">npx setup-claude</span>
          </div>
          <a
            href="https://docs.anthropic.com/en/docs/claude-code/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-zinc-200 rounded-lg px-5 py-3 text-sm font-medium hover:border-zinc-400 hover:bg-zinc-50 transition-all duration-200"
          >
            Read the docs
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-zinc-50 border-y border-zinc-100 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="animate-fade-up text-2xl font-semibold text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map(({ step, label, detail, delay }) => (
              <div key={step} className={`animate-fade-up ${delay} flex flex-col gap-2`}>
                <span className="text-4xl font-bold text-zinc-200">{step}</span>
                <span className="font-semibold text-zinc-900">{label}</span>
                <span className="text-sm font-mono text-zinc-500">{detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="animate-fade-up text-2xl font-semibold text-center mb-12">Everything you need</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map(({ icon, title, description, delay }) => (
            <div
              key={title}
              className={`animate-fade-up ${delay} group border border-zinc-100 rounded-xl p-6 hover:border-orange-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
            >
              <span className="text-2xl mb-3 block group-hover:animate-float">{icon}</span>
              <h3 className="font-semibold text-zinc-900 mb-2">{title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-zinc-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="animate-fade-up text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="animate-fade-up delay-100 text-zinc-400 mb-8">
            Run one command and have Claude Code configured for your project today.
          </p>
          <div className="animate-fade-up delay-200 animate-glow-pulse bg-zinc-800 inline-block rounded-lg px-6 py-3 font-mono text-sm text-orange-400">
            npx setup-claude
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-8 text-center text-xs text-zinc-400">
        setup-claude · Built with Next.js
      </footer>
    </div>
  );
}
