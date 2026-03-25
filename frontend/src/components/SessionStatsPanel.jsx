function SessionStatsPanel({
  glassCard,
  totalMessages,
  totalUserMessages,
  totalAiMessages,
  connectedWalletAddress,
}) {
  return (
    <section className={`${glassCard} p-6 sm:p-7`}>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/15 text-lg text-cyan-200">
          ☰
        </span>
        <h3 className="text-xl font-bold text-white">Session Stats</h3>
      </div>

      <div className="flex items-center justify-between border-b border-slate-300/15 py-3 text-slate-300">
        <span>Total Messages</span>
        <strong className="text-white">{totalMessages}</strong>
      </div>

      <div className="flex items-center justify-between border-b border-slate-300/15 py-3 text-slate-300">
        <span>User Messages</span>
        <strong className="text-white">{totalUserMessages}</strong>
      </div>

      <div className="flex items-center justify-between border-b border-slate-300/15 py-3 text-slate-300">
        <span>AI Messages</span>
        <strong className="text-white">{totalAiMessages}</strong>
      </div>

      <div className="flex items-center justify-between py-3 text-slate-300">
        <span>Wallet</span>
        <strong className="max-w-40 break-all text-right text-white">
          {connectedWalletAddress || "Not connected"}
        </strong>
      </div>
    </section>
  );
}

export default SessionStatsPanel;
