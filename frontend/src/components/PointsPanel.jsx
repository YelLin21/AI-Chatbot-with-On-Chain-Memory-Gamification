function PointsPanel({
  glassCard,
  actionButton,
  points,
  redeemPoints,
  redeemPointsForBadge,
  redeemLoading,
  redeemMessage,
  redeemTxDigest,
  rewardObjectId,
  badgeRedeemMessage,
  badgeObjectId,
  connectedWalletAddress,
}) {
  return (
    <section className={`${glassCard} flex flex-col justify-center p-6 sm:p-7`}>
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/15 text-lg text-cyan-200">
          ⟡
        </span>
        <h3 className="text-xl font-bold text-white">Points Earned</h3>
      </div>

      <div className="mb-2 text-5xl font-extrabold leading-none text-white">
        {points !== null ? points : "--"}
      </div>

      <p className="mb-5 text-slate-400">
        {points !== null
          ? points >= 5
            ? "You can redeem now"
            : "Need at least 5 points to redeem"
          : "No points yet"}
      </p>

      <button
        className={`${actionButton} bg-gradient-to-r from-sky-500 to-emerald-500 shadow-[0_14px_30px_rgba(16,185,129,0.3)]`}
        onClick={redeemPoints}
        disabled={
          redeemLoading ||
          !connectedWalletAddress ||
          points === null ||
          points < 5
        }
      >
        {redeemLoading ? "Redeeming..." : "Redeem Points"}
      </button>

      <button
        className={`${actionButton} mt-3 bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_14px_30px_rgba(129,140,248,0.3)]`}
        onClick={redeemPointsForBadge}
        disabled={
          redeemLoading ||
          !connectedWalletAddress ||
          points === null ||
          points < 10
        }
      >
        {redeemLoading ? "Redeeming..." : "Redeem for Study Badge"}
      </button>

      {redeemMessage && (
        <div className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-200">
          {redeemMessage}
        </div>
      )}

      {redeemTxDigest && (
        <div className="mt-3 rounded-xl border border-cyan-300/20 bg-slate-900/70 px-4 py-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-cyan-200">
            Redeem Tx Digest
          </p>
          <p className="break-all text-sm text-slate-100">{redeemTxDigest}</p>
        </div>
      )}

      {rewardObjectId && (
        <div className="mt-3 rounded-xl border border-cyan-300/20 bg-slate-900/70 px-4 py-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-cyan-200">
            Reward Object ID
          </p>
          <p className="break-all text-sm text-slate-100">{rewardObjectId}</p>
        </div>
      )}

      {badgeRedeemMessage && (
        <div className="mt-3 rounded-xl border border-violet-300/30 bg-violet-500/10 px-4 py-3 text-sm leading-6 text-violet-200">
          {badgeRedeemMessage}
        </div>
      )}

      {badgeObjectId && (
        <div className="mt-3 rounded-xl border border-violet-300/20 bg-slate-900/70 px-4 py-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-cyan-200">
            Study Badge Object ID
          </p>
          <p className="break-all text-sm text-slate-100">{badgeObjectId}</p>
        </div>
      )}
    </section>
  );
}

export default PointsPanel;
