#[test_only]
module ai_chatbot::chatbot_tests {

    use ai_chatbot::conversation;
    use ai_chatbot::points;
    use ai_chatbot::redeem;
    use ai_chatbot::reward_token;
    use sui::test_scenario;

    #[test]
    fun test_conversation_create_and_toggle_ai_access() {
        let user = @0x1;

        let mut scenario = test_scenario::begin(user);

        {
            let ctx = test_scenario::ctx(&mut scenario);

            let conversation_obj = conversation::create_conversation(ctx);
            sui::transfer::public_transfer(conversation_obj, user);
        };

        scenario.next_tx(user);

        {
            let mut conversation_obj = test_scenario::take_from_sender<conversation::Conversation>(&scenario);

            let ctx = test_scenario::ctx(&mut scenario);

            conversation::revoke_ai_access(&mut conversation_obj, ctx);
            conversation::grant_ai_access(&mut conversation_obj, ctx);

            sui::transfer::public_transfer(conversation_obj, user);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_append_user_message() {
        let user = @0x2;

        let mut scenario = test_scenario::begin(user);

        {
            let ctx = test_scenario::ctx(&mut scenario);

            let conversation_obj = conversation::create_conversation(ctx);
            sui::transfer::public_transfer(conversation_obj, user);
        };

        scenario.next_tx(user);

        {
            let mut conversation_obj = test_scenario::take_from_sender<conversation::Conversation>(&scenario);

            let ctx = test_scenario::ctx(&mut scenario);

            let msg = conversation::append_user_message(
                &mut conversation_obj,
                b"encrypted-user-message",
                b"nonce123",
                123456,
                ctx
            );

            sui::transfer::public_transfer(msg, user);
            sui::transfer::public_transfer(conversation_obj, user);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_points_create_award_and_burn() {
        let ai = @0x3;

        let mut scenario = test_scenario::begin(ai);

        {
            let ctx = test_scenario::ctx(&mut scenario);

            let points_account = points::create_points_account(ctx);
            let ai_cap = points::create_ai_point_capability(ctx);

            sui::transfer::public_transfer(points_account, ai);
            sui::transfer::public_transfer(ai_cap, ai);
        };

        scenario.next_tx(ai);

        {
            let mut points_account = test_scenario::take_from_sender<points::PointsAccount>(&scenario);
            let ai_cap = test_scenario::take_from_sender<points::AiPointCapability>(&scenario);

            let ctx = test_scenario::ctx(&mut scenario);

            let earn_event = points::award_points(
                &mut points_account,
                &ai_cap,
                100,
                b"good question",
                111111,
                ctx
            );

            sui::transfer::public_transfer(earn_event, ai);
            sui::transfer::public_transfer(ai_cap, ai);
            sui::transfer::public_transfer(points_account, ai);
        };

        scenario.next_tx(ai);

        {
            let mut points_account = test_scenario::take_from_sender<points::PointsAccount>(&scenario);

            let ctx = test_scenario::ctx(&mut scenario);

            let burn_event = points::burn_points(
                &mut points_account,
                40,
                b"redeem test",
                222222,
                ctx
            );

            sui::transfer::public_transfer(burn_event, ai);
            sui::transfer::public_transfer(points_account, ai);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_redeem_points_for_tokens() {
        let ai = @0x4;

        let mut scenario = test_scenario::begin(ai);

        {
            let ctx = test_scenario::ctx(&mut scenario);

            let points_account = points::create_points_account(ctx);
            let ai_point_cap = points::create_ai_point_capability(ctx);
            let reward_treasury = reward_token::init_reward_token(1_000_000, ctx);
            let ai_mint_cap = reward_token::create_ai_mint_capability(ctx);

            sui::transfer::public_transfer(points_account, ai);
            sui::transfer::public_transfer(ai_point_cap, ai);
            sui::transfer::public_transfer(reward_treasury, ai);
            sui::transfer::public_transfer(ai_mint_cap, ai);
        };

        scenario.next_tx(ai);

        {
            let mut points_account = test_scenario::take_from_sender<points::PointsAccount>(&scenario);
            let ai_point_cap = test_scenario::take_from_sender<points::AiPointCapability>(&scenario);
            let mut reward_treasury = test_scenario::take_from_sender<reward_token::RewardTreasury>(&scenario);
            let ai_mint_cap = test_scenario::take_from_sender<reward_token::AiMintCapability>(&scenario);

            let ctx = test_scenario::ctx(&mut scenario);

            let earn_event = points::award_points(
                &mut points_account,
                &ai_point_cap,
                100,
                b"earn before redeem",
                333333,
                ctx
            );

            sui::transfer::public_transfer(earn_event, ai);

            let reward_coin = redeem::redeem_points_for_tokens(
                &mut points_account,
                &mut reward_treasury,
                &ai_mint_cap,
                50,
                10,
                b"redeem reward",
                444444,
                ctx
            );

            sui::transfer::public_transfer(reward_coin, ai);
            sui::transfer::public_transfer(ai_point_cap, ai);
            sui::transfer::public_transfer(points_account, ai);
            sui::transfer::public_transfer(reward_treasury, ai);
            sui::transfer::public_transfer(ai_mint_cap, ai);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_redeem_points_for_badge() {
        let user = @0x7;

        let mut scenario = test_scenario::begin(user);

        {
            let ctx = test_scenario::ctx(&mut scenario);

            let points_account = points::create_points_account(ctx);
            let ai_point_cap = points::create_ai_point_capability(ctx);

            sui::transfer::public_transfer(points_account, user);
            sui::transfer::public_transfer(ai_point_cap, user);
        };

        scenario.next_tx(user);

        {
            let mut points_account = test_scenario::take_from_sender<points::PointsAccount>(&scenario);
            let ai_point_cap = test_scenario::take_from_sender<points::AiPointCapability>(&scenario);

            let ctx = test_scenario::ctx(&mut scenario);

            let earn_event = points::award_points(
                &mut points_account,
                &ai_point_cap,
                50,
                b"earn before badge",
                777777,
                ctx
            );

            sui::transfer::public_transfer(earn_event, user);
            sui::transfer::public_transfer(ai_point_cap, user);
            sui::transfer::public_transfer(points_account, user);
        };

        scenario.next_tx(user);

        {
            let mut points_account = test_scenario::take_from_sender<points::PointsAccount>(&scenario);

            let ctx = test_scenario::ctx(&mut scenario);

            let badge = redeem::redeem_points_for_badge(
                &mut points_account,
                30,
                b"Study streak badge",
                888888,
                ctx
            );

            sui::transfer::public_transfer(badge, user);
            sui::transfer::public_transfer(points_account, user);
        };

        test_scenario::end(scenario);
    }

    #[test, expected_failure]
    fun test_append_ai_message_fails_when_ai_access_revoked() {
        let user = @0x5;

        let mut scenario = test_scenario::begin(user);

        {
            let ctx = test_scenario::ctx(&mut scenario);

            let conversation_obj = conversation::create_conversation(ctx);
            let ai_cap = conversation::create_ai_capability(ctx);

            sui::transfer::public_transfer(conversation_obj, user);
            sui::transfer::public_transfer(ai_cap, user);
        };

        scenario.next_tx(user);

        {
            let mut conversation_obj = test_scenario::take_from_sender<conversation::Conversation>(&scenario);
            let ai_cap = test_scenario::take_from_sender<conversation::AiCapability>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);

            conversation::revoke_ai_access(&mut conversation_obj, ctx);

            let msg = conversation::append_ai_message(
                &mut conversation_obj,
                &ai_cap,
                b"encrypted-ai",
                b"nonce",
                555555,
                ctx
            );

            sui::transfer::public_transfer(msg, user);
            sui::transfer::public_transfer(ai_cap, user);
            sui::transfer::public_transfer(conversation_obj, user);
        };

        test_scenario::end(scenario);
    }

    #[test, expected_failure]
    fun test_burn_points_fails_when_insufficient_balance() {
        let user = @0x6;

        let mut scenario = test_scenario::begin(user);

        {
            let ctx = test_scenario::ctx(&mut scenario);
            let points_account = points::create_points_account(ctx);
            sui::transfer::public_transfer(points_account, user);
        };

        scenario.next_tx(user);

        {
            let mut points_account = test_scenario::take_from_sender<points::PointsAccount>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);

            let burn_event = points::burn_points(
                &mut points_account,
                1,
                b"insufficient",
                666666,
                ctx
            );

            sui::transfer::public_transfer(burn_event, user);
            sui::transfer::public_transfer(points_account, user);
        };

        test_scenario::end(scenario);
    }

    #[test, expected_failure]
    fun test_award_points_respects_daily_cap() {
        let ai_owner = @0x8;

        let mut scenario = test_scenario::begin(ai_owner);

        {
            let ctx = test_scenario::ctx(&mut scenario);

            let points_account = points::create_points_account(ctx);
            let ai_cap = points::create_ai_point_capability(ctx);

            sui::transfer::public_transfer(points_account, ai_owner);
            sui::transfer::public_transfer(ai_cap, ai_owner);
        };

        scenario.next_tx(ai_owner);

        {
            let mut points_account = test_scenario::take_from_sender<points::PointsAccount>(&scenario);
            let ai_cap = test_scenario::take_from_sender<points::AiPointCapability>(&scenario);

            let ctx = test_scenario::ctx(&mut scenario);

            let earn_event_1 = points::award_points(
                &mut points_account,
                &ai_cap,
                900,
                b"first earn",
                86400,
                ctx
            );

            sui::transfer::public_transfer(earn_event_1, ai_owner);

            // This second award should exceed the default daily cap and fail.
            let earn_event_2 = points::award_points(
                &mut points_account,
                &ai_cap,
                200,
                b"second earn over cap",
                86500,
                ctx
            );

            sui::transfer::public_transfer(earn_event_2, ai_owner);
            sui::transfer::public_transfer(ai_cap, ai_owner);
            sui::transfer::public_transfer(points_account, ai_owner);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_daily_streak_increments_on_consecutive_days() {
        let ai_owner = @0x9;

        let mut scenario = test_scenario::begin(ai_owner);

        {
            let ctx = test_scenario::ctx(&mut scenario);

            let points_account = points::create_points_account(ctx);
            let ai_cap = points::create_ai_point_capability(ctx);

            sui::transfer::public_transfer(points_account, ai_owner);
            sui::transfer::public_transfer(ai_cap, ai_owner);
        };

        scenario.next_tx(ai_owner);

        {
            let mut points_account = test_scenario::take_from_sender<points::PointsAccount>(&scenario);
            let ai_cap = test_scenario::take_from_sender<points::AiPointCapability>(&scenario);

            let ctx = test_scenario::ctx(&mut scenario);

            let ev1 = points::award_points(
                &mut points_account,
                &ai_cap,
                10,
                b"day1",
                86400,
                ctx
            );

            sui::transfer::public_transfer(ev1, ai_owner);

            let ev2 = points::award_points(
                &mut points_account,
                &ai_cap,
                10,
                b"day2",
                86400 * 2,
                ctx
            );

            sui::transfer::public_transfer(ev2, ai_owner);

            let streak = points::current_streak(&points_account);
            assert!(streak == 2, 0);

            sui::transfer::public_transfer(ai_cap, ai_owner);
            sui::transfer::public_transfer(points_account, ai_owner);
        };

        test_scenario::end(scenario);
    }

    #[test, expected_failure]
    fun test_award_points_fails_for_wrong_ai_sender() {
        let ai_owner = @0xA;
        let attacker = @0xB;

        let mut scenario = test_scenario::begin(ai_owner);

        {
            let ctx = test_scenario::ctx(&mut scenario);

            let points_account = points::create_points_account(ctx);
            let ai_cap = points::create_ai_point_capability(ctx);

            sui::transfer::public_transfer(points_account, attacker);
            sui::transfer::public_transfer(ai_cap, attacker);
        };

        scenario.next_tx(attacker);

        {
            let mut points_account = test_scenario::take_from_sender<points::PointsAccount>(&scenario);
            let ai_cap = test_scenario::take_from_sender<points::AiPointCapability>(&scenario);

            let ctx = test_scenario::ctx(&mut scenario);

            let ev = points::award_points(
                &mut points_account,
                &ai_cap,
                10,
                b"attack",
                86400,
                ctx
            );

            sui::transfer::public_transfer(ev, attacker);
            sui::transfer::public_transfer(ai_cap, attacker);
            sui::transfer::public_transfer(points_account, attacker);
        };

        test_scenario::end(scenario);
    }

    #[test, expected_failure]
    fun test_mint_reward_fails_for_wrong_ai_sender() {
        let ai_owner = @0xC;
        let attacker = @0xD;

        let mut scenario = test_scenario::begin(ai_owner);

        {
            let ctx = test_scenario::ctx(&mut scenario);

            let treasury = reward_token::init_reward_token(1000, ctx);
            let ai_mint_cap = reward_token::create_ai_mint_capability(ctx);

            sui::transfer::public_transfer(treasury, attacker);
            sui::transfer::public_transfer(ai_mint_cap, attacker);
        };

        scenario.next_tx(attacker);

        {
            let mut treasury = test_scenario::take_from_sender<reward_token::RewardTreasury>(&scenario);
            let ai_mint_cap = test_scenario::take_from_sender<reward_token::AiMintCapability>(&scenario);

            let ctx = test_scenario::ctx(&mut scenario);

            let reward = reward_token::mint_reward(
                &mut treasury,
                &ai_mint_cap,
                10,
                ctx
            );

            sui::transfer::public_transfer(reward, attacker);
            sui::transfer::public_transfer(ai_mint_cap, attacker);
            sui::transfer::public_transfer(treasury, attacker);
        };

        test_scenario::end(scenario);
    }
}