# AI Chatbot with On-Chain Memory and Gamification

End-to-end Sui Move + React + Node implementation for the AI chatbot challenge.

## What This Project Implements

### 1) On-chain conversation storage
- Encrypted messages are produced client-side (AES-GCM in browser) before chain writes.
- User messages and AI messages are stored as on-chain `MessageEntry` objects.
- Conversation object tracks owner and AI access toggle.
- User can revoke or grant AI write access.

### 2) AI chat integration
- Backend calls Gemini and returns structured `{ reply, points }` responses.
- Chat scoring is engagement-aware and includes low-effort anti-abuse guard.
- Frontend sends recent chat history context with each user message.

### 3) Points system (earn and burn)
- On-chain `PointsAccount` tracks `balance`, `total_earned`, and `total_burned`.
- AI-scored points are awarded on-chain via `award_points`.
- Redemption burns points on-chain in the same transaction as reward minting.
- Additional redemption path burns points for a non-fungible `StudyBadge` reward.

### 4) AI-minted reward token
- Reward treasury tracks max supply and minted totals.
- Redeem flow mints `RewardCoin` and transfers it to user wallet in the redeem transaction.
 - Users can also burn `RewardCoin` via the `burn_reward` function for future utility.

### 5) Security highlights
- Message encryption happens in the frontend before sending on-chain.
- Capability-gated functions are used for AI actions in contracts.
- AI access can be revoked per conversation.
- Low-effort message filter blocks trivial point farming at backend scoring layer.

## Repository Structure

- `contracts/`: Sui Move modules and tests
- `frontend/`: React + Vite dApp UI and wallet integration
- `backend/`: Express API for AI reply generation and scoring

## Smart Contract Modules

- `conversation.move`
	- create conversation
	- append encrypted user/AI messages
	- revoke/grant AI access
- `points.move`
	- create points account
	- award points
	- burn points
- `reward_token.move`
	- init treasury
	- mint reward token
	- burn reward token
- `redeem.move`
	- burn points and mint reward token in one flow

## Local Setup

### Prerequisites
- Node.js 18+
- Sui CLI
- A Sui testnet wallet with gas

### 1) Contracts
1. `cd contracts`
2. `sui move test`
3. Publish to testnet and update package id if needed.

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
4. Open `http://localhost:5173`

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

## Testing Status

- Move tests include:
	- conversation creation and AI access toggle
	- user message append
	- points award and burn
	- redeem points for tokens
	- edge failures (revoked AI access, insufficient balance)

## Notes and Trade-offs

- This implementation prioritizes an end-to-end working flow suitable for challenge review.
- Scoring anti-abuse policy is currently backend-rule based and can be expanded with stronger heuristics.
- UI is intentionally transparent, exposing object ids and transaction outputs for evaluator verification.

## Demo Checklist for Reviewers

- [ ] Send meaningful prompt and receive AI reply
- [ ] Confirm user/AI message objects are created on-chain
- [ ] Confirm points increase after AI response
- [ ] Redeem and verify point burn + reward coin mint transaction
- [ ] Redeem and verify alternate reward (StudyBadge) minting
- [ ] Revoke AI access and confirm AI append fails
