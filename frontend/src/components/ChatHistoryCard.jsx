function ChatHistoryCard({ glassCard, messages }) {
  return (
    <section className={`${glassCard} p-6 sm:p-7`}>
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/15 text-lg text-cyan-200">
          ✦
        </span>
        <h3 className="text-xl font-bold text-white">Chat History</h3>
      </div>

      <div className="flex flex-col gap-3.5">
        {messages.length === 0 ? (
          <p className="text-slate-400">
            No messages yet. Connect your wallet and start your first
            conversation.
          </p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3.5 leading-7 ${
                  msg.role === "user"
                    ? "rounded-br-md border border-cyan-300/30 bg-cyan-500/15"
                    : "rounded-bl-md border border-slate-300/20 bg-slate-900/85"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wide text-cyan-200">
                  {msg.role === "user" ? "You" : "AI"}
                </span>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-200 sm:text-base">
                  {msg.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default ChatHistoryCard;
