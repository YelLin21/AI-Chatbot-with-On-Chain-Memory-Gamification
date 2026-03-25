module ai_chatbot::points {

    const E_NOT_OWNER: u64 = 0;
    const E_INSUFFICIENT_POINTS: u64 = 1;
    const E_INVALID_AI_CAP: u64 = 2;
    const E_DAILY_CAP_REACHED: u64 = 3;
    const E_POINTS_TOO_HIGH: u64 = 4;

    const DEFAULT_DAILY_CAP: u64 = 1000;
    const MAX_POINTS_PER_MESSAGE: u64 = 200;

    public struct PointsAccount has key, store {
        id: UID,
        owner: address,
        balance: u64,
        total_earned: u64,
        total_burned: u64,
        last_earn_day: u64,
        current_streak: u64,
        today_earned: u64,
        daily_cap: u64,
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
            last_earn_day: 0,
            current_streak: 0,
            today_earned: 0,
            daily_cap: DEFAULT_DAILY_CAP,
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

        assert!(points <= MAX_POINTS_PER_MESSAGE, E_POINTS_TOO_HIGH);

        let day = day_from_timestamp(timestamp);

        if (account.last_earn_day == 0) {
            account.last_earn_day = day;
            account.current_streak = 1;
            account.today_earned = 0;
        } else {
            if (day > account.last_earn_day) {
                if (day == account.last_earn_day + 1) {
                    account.current_streak = account.current_streak + 1;
                } else {
                    account.current_streak = 1;
                };
                account.last_earn_day = day;
                account.today_earned = 0;
            }
        };

        let mut effective_points = points;
        if (account.current_streak >= 3) {
            let bonus = points / 10; // +10% streak bonus for streak >= 3
            effective_points = points + bonus;
        };

        assert!(account.today_earned + effective_points <= account.daily_cap, E_DAILY_CAP_REACHED);

        account.balance = account.balance + effective_points;
        account.total_earned = account.total_earned + effective_points;
        account.today_earned = account.today_earned + effective_points;

        PointsEvent {
            id: object::new(ctx),
            account_id: object::uid_to_inner(&account.id),
            points: effective_points,
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

    public fun owner_of(account: &PointsAccount): address {
        account.owner
    }

    public fun current_streak(account: &PointsAccount): u64 {
        account.current_streak
    }

    public fun day_from_timestamp(timestamp: u64): u64 {
        // Treat timestamp as seconds since epoch and use 24h windows
        timestamp / 86400
    }
}