import { ConnectButton } from "@mysten/dapp-kit-react/ui";

function StartConversationCard({
  glassCard,
  inputBase,
  actionButton,
  connectedWalletAddress,
  clearChat,
  createConversation,
  creatingConversation,
  createAiCapability,
  creatingAiCap,
  createPointsAccount,
  creatingPointsAccount,
  createAiPointCapability,
  creatingAiPointCap,
  initRewardTreasury,
  creatingRewardTreasury,
  createAiMintCapability,
  creatingAiMintCap,
  conversationId,
  exportConversationHistory,
  exportLoading,
  exportedHistory,
  aiCapabilityId,
  pointsAccountId,
  aiPointCapabilityId,
  rewardTreasuryId,
  aiMintCapabilityId,
  chainStatus,
  lastUserMessageId,
  lastAiMessageId,
  message,
  setMessage,
  sendMessage,
  loading,
}) {
  return (
    <section className={`${glassCard} p-6 sm:p-7`}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Start a Conversation</h2>
          <p className="mt-1 text-slate-400">
            Connected to your Gemini-powered backend
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_#34d399]"></span>
            Backend Live
          </div>

          <button
            className="rounded-xl border border-slate-300/25 bg-slate-900/80 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-slate-200/40"
            onClick={clearChat}
          >
            Clear Chat
          </button>
        </div>
      </div>

      <div className="mb-5 grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-200">
              Wallet Connection
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Connect your Sui wallet to chat and redeem
            </p>
          </div>

          <ConnectButton />
        </div>

        <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
            Connected Wallet
          </p>
          <p className="break-all text-sm text-slate-100">
            {connectedWalletAddress || "No wallet connected"}
          </p>
        </div>

        <button
          className={`${actionButton} bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-[0_14px_30px_rgba(79,70,229,0.35)]`}
          onClick={createConversation}
          disabled={!connectedWalletAddress || creatingConversation}
        >
          {creatingConversation
            ? "Creating Conversation..."
            : "Create On-Chain Conversation"}
        </button>

        <button
          className={`${actionButton} bg-gradient-to-r from-fuchsia-500 to-pink-500 shadow-[0_14px_30px_rgba(217,70,239,0.35)]`}
          onClick={createAiCapability}
          disabled={!connectedWalletAddress || creatingAiCap}
        >
          {creatingAiCap ? "Creating AI Capability..." : "Create AI Capability"}
        </button>

        <button
          className={`${actionButton} bg-gradient-to-r from-violet-500 to-indigo-500 shadow-[0_14px_30px_rgba(99,102,241,0.35)]`}
          onClick={createPointsAccount}
          disabled={!connectedWalletAddress || creatingPointsAccount}
        >
          {creatingPointsAccount
            ? "Creating Points Account..."
            : "Create Points Account"}
        </button>

        <button
          className={`${actionButton} bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_14px_30px_rgba(245,158,11,0.35)]`}
          onClick={createAiPointCapability}
          disabled={!connectedWalletAddress || creatingAiPointCap}
        >
          {creatingAiPointCap
            ? "Creating AI Point Capability..."
            : "Create AI Point Capability"}
        </button>

        <button
          className={`${actionButton} bg-gradient-to-r from-emerald-500 to-lime-500 shadow-[0_14px_30px_rgba(16,185,129,0.35)]`}
          onClick={initRewardTreasury}
          disabled={!connectedWalletAddress || creatingRewardTreasury}
        >
          {creatingRewardTreasury
            ? "Initializing Reward Treasury..."
            : "Init Reward Treasury"}
        </button>

        <button
          className={`${actionButton} bg-gradient-to-r from-rose-500 to-red-500 shadow-[0_14px_30px_rgba(244,63,94,0.35)]`}
          onClick={createAiMintCapability}
          disabled={!connectedWalletAddress || creatingAiMintCap}
        >
          {creatingAiMintCap
            ? "Creating AI Mint Capability..."
            : "Create AI Mint Capability"}
        </button>

        <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
            Conversation Status
          </p>
          <p className="break-all text-sm text-slate-100">
            {conversationId || "No conversation created yet"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-200">
              Export On-Chain History
            </p>
            <button
              className="rounded-xl border border-cyan-300/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200/70 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={exportConversationHistory}
              disabled={
                exportLoading || !connectedWalletAddress || !conversationId
              }
            >
              {exportLoading ? "Exporting..." : "Export"}
            </button>
          </div>
          <p className="mb-2 text-xs font-semibold text-slate-400">
            Decrypts and exports all on-chain messages for this conversation.
          </p>
          <textarea
            rows="6"
            value={exportedHistory}
            readOnly
            placeholder="Exported history will appear here as JSON after you click Export."
            className={`${inputBase} mt-1 resize-y text-xs`}
          />
        </div>

        <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
            AI Capability Status
          </p>
          <p className="break-all text-sm text-slate-100">
            {aiCapabilityId || "No AI capability created yet"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
            Points Account ID
          </p>
          <p className="break-all text-sm text-slate-100">
            {pointsAccountId || "No points account created yet"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
            AI Point Capability ID
          </p>
          <p className="break-all text-sm text-slate-100">
            {aiPointCapabilityId || "No AI point capability created yet"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
            Reward Treasury ID
          </p>
          <p className="break-all text-sm text-slate-100">
            {rewardTreasuryId || "No reward treasury created yet"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
            AI Mint Capability ID
          </p>
          <p className="break-all text-sm text-slate-100">
            {aiMintCapabilityId || "No AI mint capability created yet"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
            On-Chain Message Status
          </p>
          <p className="mb-2 text-sm text-emerald-300">
            {chainStatus || "No message stored yet"}
          </p>

          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-cyan-200">
            Last User Message ID
          </p>
          <p className="mb-3 break-all text-sm text-slate-100">
            {lastUserMessageId || "No user message yet"}
          </p>

          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-cyan-200">
            Last AI Message ID
          </p>
          <p className="break-all text-sm text-slate-100">
            {lastAiMessageId || "No AI message yet"}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-semibold text-slate-200">
          Your Message
        </label>
        <textarea
          rows="5"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask something about blockchain, AI, rewards, or your project..."
          className={`${inputBase} resize-y`}
        />
      </div>

      <button
        className={`${actionButton} bg-gradient-to-r from-cyan-500 to-emerald-500 shadow-[0_14px_30px_rgba(6,182,212,0.35)]`}
        onClick={sendMessage}
        disabled={
          loading ||
          !connectedWalletAddress ||
          !conversationId ||
          !aiCapabilityId
        }
      >
        {loading ? "Generating..." : "Send Message"}
      </button>
    </section>
  );
}

export default StartConversationCard;
