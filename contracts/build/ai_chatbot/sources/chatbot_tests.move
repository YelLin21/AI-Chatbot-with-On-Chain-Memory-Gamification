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
}