module ai_chatbot::redeem {

    use ai_chatbot::points::{Self, PointsAccount, PointsEvent};
    use ai_chatbot::reward_token::{Self, RewardCoin, RewardTreasury, AiMintCapability};
    use sui::transfer;
    use sui::tx_context;

    const E_INVALID_REDEMPTION: u64 = 0;

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

        let user = tx_context::sender(ctx);

        let burn_event: PointsEvent = points::burn_points(
            points_account,
            points_to_burn,
            reason,
            timestamp,
            ctx
        );

        transfer::public_transfer(burn_event, user);

        reward_token::mint_reward(
            reward_treasury,
            mint_cap,
            token_amount,
            ctx
        )
    }
}