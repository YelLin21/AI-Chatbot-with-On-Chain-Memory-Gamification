module ai_chatbot::conversation {

    const E_NOT_OWNER: u64 = 0;
    const E_AI_ACCESS_DISABLED: u64 = 1;
    const E_INVALID_AI_CAP: u64 = 2;

    public struct Conversation has key, store {
        id: UID,
        owner: address,
        ai_access_enabled: bool,
        message_count: u64,
    }

    public struct MessageEntry has key, store {
        id: UID,
        conversation_id: ID,
        sender_type: u8, // 0 = user, 1 = ai
        ciphertext: vector<u8>,
        nonce: vector<u8>,
        timestamp: u64,
    }

    public struct AiCapability has key, store {
        id: UID,
        ai_owner: address,
    }

    public fun create_conversation(ctx: &mut TxContext): Conversation {
        let user = tx_context::sender(ctx);

        Conversation {
            id: object::new(ctx),
            owner: user,
            ai_access_enabled: true,
            message_count: 0,
        }
    }

    public fun create_ai_capability(ctx: &mut TxContext): AiCapability {
        let ai = tx_context::sender(ctx);

        AiCapability {
            id: object::new(ctx),
            ai_owner: ai,
        }
    }

    public fun revoke_ai_access(conversation: &mut Conversation, ctx: &TxContext) {
        let user = tx_context::sender(ctx);
        assert!(conversation.owner == user, E_NOT_OWNER);

        conversation.ai_access_enabled = false;
    }

    public fun grant_ai_access(conversation: &mut Conversation, ctx: &TxContext) {
        let user = tx_context::sender(ctx);
        assert!(conversation.owner == user, E_NOT_OWNER);

        conversation.ai_access_enabled = true;
    }

    public fun append_user_message(
        conversation: &mut Conversation,
        ciphertext: vector<u8>,
        nonce: vector<u8>,
        timestamp: u64,
        ctx: &mut TxContext
    ): MessageEntry {
        let user = tx_context::sender(ctx);
        assert!(conversation.owner == user, E_NOT_OWNER);

        conversation.message_count = conversation.message_count + 1;

        MessageEntry {
            id: object::new(ctx),
            conversation_id: object::uid_to_inner(&conversation.id),
            sender_type: 0,
            ciphertext,
            nonce,
            timestamp,
        }
    }

    public fun append_ai_message(
        conversation: &mut Conversation,
        _cap: &AiCapability,
        ciphertext: vector<u8>,
        nonce: vector<u8>,
        timestamp: u64,
        ctx: &mut TxContext
    ): MessageEntry {
        let ai = tx_context::sender(ctx);

        assert!(conversation.ai_access_enabled, E_AI_ACCESS_DISABLED);
        assert!(_cap.ai_owner == ai, E_INVALID_AI_CAP);

        conversation.message_count = conversation.message_count + 1;

        MessageEntry {
            id: object::new(ctx),
            conversation_id: object::uid_to_inner(&conversation.id),
            sender_type: 1,
            ciphertext,
            nonce,
            timestamp,
        }
    }
}