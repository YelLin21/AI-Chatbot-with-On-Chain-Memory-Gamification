module ai_chatbot::points {

    const E_NOT_OWNER: u64 = 0;
    const E_INSUFFICIENT_POINTS: u64 = 1;
    const E_INVALID_AI_CAP: u64 = 2;

    public struct PointsAccount has key, store {
        id: UID,
        owner: address,
        balance: u64,
        total_earned: u64,
        total_burned: u64,
    }

    public struct PointsEvent has key, store {
        id: UID,
        account_id: ID,
        points: u64,
        event_type: u8, // 0 = earn, 1 = burn
        reason: vector<u8>,
        timestamp: u64,
    }

    public struct AiPointCapability has key, store {
        id: UID,
        ai_owner: address,
    }

    public fun create_points_account(ctx: &mut TxContext): PointsAccount {
        let user = tx_context::sender(ctx);

        PointsAccount {
            id: object::new(ctx),
            owner: user,
            balance: 0,
            total_earned: 0,
            total_burned: 0,
        }
    }

    public fun create_ai_point_capability(ctx: &mut TxContext): AiPointCapability {
        let ai = tx_context::sender(ctx);

        AiPointCapability {
            id: object::new(ctx),
            ai_owner: ai,
        }
    }

    public fun award_points(
        account: &mut PointsAccount,
        cap: &AiPointCapability,
        points: u64,
        reason: vector<u8>,
        timestamp: u64,
        ctx: &mut TxContext
    ): PointsEvent {
        let ai = tx_context::sender(ctx);
        assert!(cap.ai_owner == ai, E_INVALID_AI_CAP);

        account.balance = account.balance + points;
        account.total_earned = account.total_earned + points;

        PointsEvent {
            id: object::new(ctx),
            account_id: object::uid_to_inner(&account.id),
            points,
            event_type: 0,
            reason,
            timestamp,
        }
    }

    public fun burn_points(
        account: &mut PointsAccount,
        points: u64,
        reason: vector<u8>,
        timestamp: u64,
        ctx: &mut TxContext
    ): PointsEvent {
        let user = tx_context::sender(ctx);
        assert!(account.owner == user, E_NOT_OWNER);
        assert!(account.balance >= points, E_INSUFFICIENT_POINTS);

        account.balance = account.balance - points;
        account.total_burned = account.total_burned + points;

        PointsEvent {
            id: object::new(ctx),
            account_id: object::uid_to_inner(&account.id),
            points,
            event_type: 1,
            reason,
            timestamp,
        }
    }
}