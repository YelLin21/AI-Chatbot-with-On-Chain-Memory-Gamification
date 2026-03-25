# AI Chatbot with On-Chain Memory and Gamification

End-to-end Sui Move + React + Node implementation for the AI chatbot challenge.

## What This Project Implements (Mapped to Brief)

### 1) On-chain conversation storage
- Sui Move `Conversation` and `MessageEntry` objects store chat history on-chain.
- All messages are encrypted client-side with AES-GCM before being written.
- `Conversation.owner` is the wallet address; data is wallet-owned.
- `AiCapability` controls who can append AI messages; access can be revoked and re-granted.
- Frontend can export and decrypt the full on-chain history for the connected wallet.

### 2) AI chat integration
- Backend uses Google Gemini (any LLM allowed by brief) via `@google/genai`.
- Prompt includes recent chat history and wallet address for context.
- Model returns structured JSON `{ reply, points }` which is strictly parsed.
- Frontend stores the AI reply as an encrypted on-chain `MessageEntry`.
- Backend applies basic abuse detection (very short or spammy messages get 0 points).

### 3) Points system (earn, streaks, cap, burn)
- `PointsAccount` tracks `balance`, `total_earned`, `total_burned`, `last_earn_day`, `current_streak`, `today_earned`, and `daily_cap`.
- `award_points` can only be called by an address that holds `AiPointCapability`.
- Per-message limit (`MAX_POINTS_PER_MESSAGE`), streak-based bonus, and `daily_cap` enforce anti-abuse.
- `burn_points` lets the user burn points for redemptions; all changes are on-chain and emitted via `PointsEvent`.

### 4) Reward token and badge
- `RewardTreasury` enforces a configurable `max_supply` and tracks `total_minted` and `total_burned`.
- `AiMintCapability` restricts reward minting to the AI service.
- `redeem_points_for_tokens` burns points and mints `RewardCoin` to the user in the same transaction.
- `Redeem for Study Badge` uses `redeem_points_for_badge` to burn points and mint a non‑fungible `StudyBadge` object.
- Users can later burn `RewardCoin` via `burn_reward` for future utility hooks.

### 5) Security and abuse prevention
- Messages are encrypted in the browser; Sui only sees ciphertext and nonce.
- Capability pattern (`AiCapability`, `AiPointCapability`, `AiMintCapability`) guards all privileged writes.
- AI access is per‑conversation and revocable by the owner.
- Backend rejects low‑effort spam and always returns bounded point values.
- On-chain caps (daily cap, max per message) provide a second layer of protection.

## Repository Structure

- `contracts/`: Sui Move modules and tests
- `frontend/`: React + Vite dApp UI and wallet integration
- `backend/`: Express API for AI reply generation and scoring

## Smart Contract Modules

- `conversation.move`
	- `Conversation`, `MessageEntry`, and `AiCapability` types.
	- `create_conversation`, `create_ai_capability` for object setup.
	- `append_user_message`, `append_ai_message` for encrypted history writes.
	- `revoke_ai_access`, `grant_ai_access` to toggle AI write permissions.
- `points.move`
	- `PointsAccount`, `PointsEvent`, and `AiPointCapability`.
	- `create_points_account`, `create_ai_point_capability`.
	- `award_points` with daily streak and cap logic.
	- `burn_points` and helpers such as `owner_of` and `current_streak`.
- `reward_token.move`
	- `RewardTreasury`, `RewardCoin`, `AiMintCapability`.
	- `init_reward_token`, `create_ai_mint_capability`.
	- `mint_reward`, `mint_reward_to_user`, `burn_reward`.
- `redeem.move`
	- `redeem_points_for_tokens` (burn points + mint fungible rewards atomically).
	- `StudyBadge` struct.
	- `redeem_points_for_badge` (burn points + mint badge).

## Local Setup

### Prerequisites
- Node.js 18+
- Sui CLI
- A Sui testnet wallet with gas

### 1) Contracts
1. `cd contracts`
2. Run tests: `sui move test`
3. Publish to testnet: `sui client publish --gas-budget 100000000`
4. Copy the new package id and update `PACKAGE_ID` at the top of `frontend/src/App.jsx`.

### 2) Backend
1. `cd backend`
2. Create `.env`:
	 - `PORT=4000`
	 - `GEMINI_API_KEY=your_key_here`
3. `npm install`
4. `npm run start`

### 3) Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Vite will print the dev URL (for example `http://localhost:5173` or `5174`). Open that in the browser.

## Core User Flow

1. Connect wallet.
2. Create conversation, AI capability, points account, AI point capability, reward treasury, and AI mint capability.
3. Send chat message.
4. User message is encrypted and written on-chain.
5. Backend returns AI reply and engagement points.
6. AI reply is encrypted and written on-chain.
7. Points are awarded on-chain.
8. Redeem burns points and mints reward token on-chain.
9. Optionally redeem points for a non-fungible `StudyBadge` reward.

## Move Test Suite (Coverage)

Move tests exercise both happy paths and access control / edge cases:

- Conversation:
	- create conversation and toggle AI access on/off.
	- append user messages.
	- fail to append AI message after access is revoked.
- Points:
	- create, award, and burn points successfully.
	- fail to burn with insufficient balance.
	- fail when awarding from wrong AI sender.
	- respect daily cap and increment streak across days.
- Rewards and redeem:
	- redeem points for fungible `RewardCoin`.
	- redeem points for `StudyBadge`.
	- fail to mint rewards from wrong AI sender.

## Notes and Trade-offs

- Focus is on a clear end-to-end earn → chat → redeem → mint flow rather than complex UI.
- AI quality scoring lives off-chain in the Gemini prompt for flexibility; on-chain caps ensure safety.
- Encryption key is stored locally in the browser for demo simplicity (not production-grade key management).
- UI surfaces object IDs and digests so reviewers can independently inspect on-chain state.

## Short Demo Link
https://drive.google.com/file/d/1Hiv8QPVYKThB-H56d0Mzr5SricI1DUx0/view?usp=drive_link