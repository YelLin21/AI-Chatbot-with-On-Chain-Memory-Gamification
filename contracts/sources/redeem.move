module ai_chatbot::redeem {

    use ai_chatbot::points::{Self, PointsAccount, PointsEvent};
    use ai_chatbot::reward_token::{Self, RewardCoin, RewardTreasury, AiMintCapability};
    use sui::transfer;

    const E_INVALID_REDEMPTION: u64 = 0;

    /// Simple non-fungible reward that can be redeemed with points.
    public struct StudyBadge has key, store {
        id: UID,
        owner: address,
        label: vector<u8>,
        earned_at: u64,
    }

    public fun redeem_points_for_tokens(
        points_account: &mut PointsAccount,
        reward_treasury: &mut RewardTreasury,
        mint_cap: &AiMintCapability,
        points_to_burn: u64,
        token_amount: u64,
        reason: vector<u8>,
        timestamp: u64,
        ctx: &mut TxContext
    ): RewardCoin {
        assert!(points_to_burn > 0, E_INVALID_REDEMPTION);
        assert!(token_amount > 0, E_INVALID_REDEMPTION);

        let user = points::owner_of(points_account);

        let burn_event: PointsEvent = points::burn_points(
            points_account,
            points_to_burn,
            reason,
            timestamp,
            ctx
        );

        transfer::public_transfer(burn_event, user);

        reward_token::mint_reward_to_user(
            reward_treasury,
            mint_cap,
            user,
            token_amount,
            ctx
        )
    }

    /// Alternate redemption path: burn points to mint a non-fungible study badge.
    /// This provides the "at least one other reward" requirement from the challenge.
    public fun redeem_points_for_badge(
        points_account: &mut PointsAccount,
        points_to_burn: u64,
        label: vector<u8>,
        timestamp: u64,
        ctx: &mut TxContext
    ): StudyBadge {
        assert!(points_to_burn > 0, E_INVALID_REDEMPTION);

        let user = points::owner_of(points_account);

        let burn_event: PointsEvent = points::burn_points(
            points_account,
            points_to_burn,
            label,
            timestamp,
            ctx
        );

        transfer::public_transfer(burn_event, user);

        StudyBadge {
            id: object::new(ctx),
            owner: user,
            label,
            earned_at: timestamp,
        }
    }
}