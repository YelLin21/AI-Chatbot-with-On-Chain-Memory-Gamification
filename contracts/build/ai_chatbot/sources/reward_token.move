module ai_chatbot::reward_token {

    const E_INVALID_MINT_CAP: u64 = 0;
    const E_MAX_SUPPLY_REACHED: u64 = 1;

    public struct RewardCoin has key, store {
        id: UID,
        amount: u64,
        owner: address,
    }

    public struct RewardTreasury has key, store {
        id: UID,
        max_supply: u64,
        total_minted: u64,
        total_burned: u64,
    }

    public struct AiMintCapability has key, store {
        id: UID,
        ai_owner: address,
    }

    public fun init_reward_token(
        max_supply: u64,
        ctx: &mut TxContext
    ): RewardTreasury {
        RewardTreasury {
            id: object::new(ctx),
            max_supply,
            total_minted: 0,
            total_burned: 0,
        }
    }

    public fun create_ai_mint_capability(ctx: &mut TxContext): AiMintCapability {
        let ai = tx_context::sender(ctx);

        AiMintCapability {
            id: object::new(ctx),
            ai_owner: ai,
        }
    }

    public fun mint_reward(
        treasury: &mut RewardTreasury,
        cap: &AiMintCapability,
        amount: u64,
        ctx: &mut TxContext
    ): RewardCoin {
        let ai = tx_context::sender(ctx);

        assert!(cap.ai_owner == ai, E_INVALID_MINT_CAP);
        assert!(treasury.total_minted + amount <= treasury.max_supply, E_MAX_SUPPLY_REACHED);

        treasury.total_minted = treasury.total_minted + amount;

        RewardCoin {
            id: object::new(ctx),
            amount,
            owner: ai,
        }
    }

    public fun mint_reward_to_user(
        treasury: &mut RewardTreasury,
        cap: &AiMintCapability,
        recipient: address,
        amount: u64,
        ctx: &mut TxContext
    ): RewardCoin {
        let ai = tx_context::sender(ctx);

        assert!(cap.ai_owner == ai, E_INVALID_MINT_CAP);
        assert!(treasury.total_minted + amount <= treasury.max_supply, E_MAX_SUPPLY_REACHED);

        treasury.total_minted = treasury.total_minted + amount;

        RewardCoin {
            id: object::new(ctx),
            amount,
            owner: recipient,
        }
    }

    public fun burn_reward(
        treasury: &mut RewardTreasury,
        coin_obj: RewardCoin
    ) {
        treasury.total_burned = treasury.total_burned + coin_obj.amount;
        let RewardCoin { id, amount: _, owner: _ } = coin_obj;
        object::delete(id);
    }
}