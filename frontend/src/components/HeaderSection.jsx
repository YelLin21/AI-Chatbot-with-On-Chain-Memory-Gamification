function HeaderSection({ glassCard }) {
  return (
    <section className={`${glassCard} p-6 sm:p-8`}>
      <div className="mb-4 inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
        AI Rewards Chat
      </div>
      <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        AI Chat Dashboard
      </h1>
      <p className="max-w-3xl text-base leading-7 text-slate-300">
        Ask questions, get AI responses, earn points, and redeem them in a
        polished blockchain-ready experience.
      </p>
    </section>
  );
}

export default HeaderSection;
