import { useEffect, useState } from "react";
import axios from "axios";
import { ConnectButton } from "@mysten/dapp-kit-react/ui";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { Transaction } from "@mysten/sui/transactions";

const PACKAGE_ID =
  "0xdff20dd4709de0802479f95f6d0346114b59b3d4a7e99c83c8dc56776eea3987";

const generateKey = async () => {
  return await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

const exportKey = async (key) => {
  const raw = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
};

const importKey = async (base64Key) => {
  const raw = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
};

const encryptMessage = async (plainText, key) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plainText);

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return {
    ciphertext: Array.from(new Uint8Array(cipherBuffer)),
    nonce: Array.from(iv),
  };
};

const textToBytes = (text) => Array.from(new TextEncoder().encode(text));

const decryptMessage = async (ciphertextArray, nonceArray, key) => {
  const iv = new Uint8Array(nonceArray);
  const cipherBytes = new Uint8Array(ciphertextArray);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipherBytes
  );

  return new TextDecoder().decode(plainBuffer);
};

function App() {
  const account = useCurrentAccount();
  const connectedWalletAddress = account?.address || "";
  const dAppKit = useDAppKit();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(false);

  const [redeemMessage, setRedeemMessage] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemTxDigest, setRedeemTxDigest] = useState("");
  const [rewardObjectId, setRewardObjectId] = useState("");

  const [conversationId, setConversationId] = useState("");
  const [creatingConversation, setCreatingConversation] = useState(false);

  const [aiCapabilityId, setAiCapabilityId] = useState("");
  const [creatingAiCap, setCreatingAiCap] = useState(false);

  const [pointsAccountId, setPointsAccountId] = useState("");
  const [creatingPointsAccount, setCreatingPointsAccount] = useState(false);

  const [aiPointCapabilityId, setAiPointCapabilityId] = useState("");
  const [creatingAiPointCap, setCreatingAiPointCap] = useState(false);

  const [rewardTreasuryId, setRewardTreasuryId] = useState("");
  const [creatingRewardTreasury, setCreatingRewardTreasury] = useState(false);

  const [aiMintCapabilityId, setAiMintCapabilityId] = useState("");
  const [creatingAiMintCap, setCreatingAiMintCap] = useState(false);

  const [localKey, setLocalKey] = useState("");

  const [lastUserMessageId, setLastUserMessageId] = useState("");
  const [lastAiMessageId, setLastAiMessageId] = useState("");
  const [chainStatus, setChainStatus] = useState("");

  const [exportLoading, setExportLoading] = useState(false);
  const [exportedHistory, setExportedHistory] = useState("");
  const [badgeRedeemMessage, setBadgeRedeemMessage] = useState("");
  const [badgeObjectId, setBadgeObjectId] = useState("");

  useEffect(() => {
    const setupKey = async () => {
      if (!localKey) {
        const key = await generateKey();
        const exported = await exportKey(key);
        setLocalKey(exported);
      }
    };

    setupKey();
  }, [localKey]);

  useEffect(() => {
    const savedConversationId = localStorage.getItem("conversationId");
    const savedAiCapabilityId = localStorage.getItem("aiCapabilityId");
    const savedPointsAccountId = localStorage.getItem("pointsAccountId");
    const savedAiPointCapabilityId = localStorage.getItem("aiPointCapabilityId");
    const savedRewardTreasuryId = localStorage.getItem("rewardTreasuryId");
    const savedAiMintCapabilityId = localStorage.getItem("aiMintCapabilityId");
    const savedMessages = localStorage.getItem("messages");
    const savedLastUserMessageId = localStorage.getItem("lastUserMessageId");
    const savedLastAiMessageId = localStorage.getItem("lastAiMessageId");
    const savedChainStatus = localStorage.getItem("chainStatus");
    const savedRedeemTxDigest = localStorage.getItem("redeemTxDigest");
    const savedRewardObjectId = localStorage.getItem("rewardObjectId");
    const savedPoints = localStorage.getItem("points");
    const savedExportedHistory = localStorage.getItem("exportedHistory");
    const savedBadgeRedeemMessage = localStorage.getItem("badgeRedeemMessage");
    const savedBadgeObjectId = localStorage.getItem("badgeObjectId");

    if (savedConversationId) setConversationId(savedConversationId);
    if (savedAiCapabilityId) setAiCapabilityId(savedAiCapabilityId);
    if (savedPointsAccountId) setPointsAccountId(savedPointsAccountId);
    if (savedAiPointCapabilityId) setAiPointCapabilityId(savedAiPointCapabilityId);
    if (savedRewardTreasuryId) setRewardTreasuryId(savedRewardTreasuryId);
    if (savedAiMintCapabilityId) setAiMintCapabilityId(savedAiMintCapabilityId);
    if (savedMessages) setMessages(JSON.parse(savedMessages));
    if (savedLastUserMessageId) setLastUserMessageId(savedLastUserMessageId);
    if (savedLastAiMessageId) setLastAiMessageId(savedLastAiMessageId);
    if (savedChainStatus) setChainStatus(savedChainStatus);
    if (savedRedeemTxDigest) setRedeemTxDigest(savedRedeemTxDigest);
    if (savedRewardObjectId) setRewardObjectId(savedRewardObjectId);
    if (savedPoints) setPoints(Number(savedPoints));
    if (savedExportedHistory) setExportedHistory(savedExportedHistory);
    if (savedBadgeRedeemMessage) setBadgeRedeemMessage(savedBadgeRedeemMessage);
    if (savedBadgeObjectId) setBadgeObjectId(savedBadgeObjectId);
  }, []);

  useEffect(() => {
    localStorage.setItem("conversationId", conversationId);
  }, [conversationId]);

  useEffect(() => {
    localStorage.setItem("aiCapabilityId", aiCapabilityId);
  }, [aiCapabilityId]);

  useEffect(() => {
    localStorage.setItem("pointsAccountId", pointsAccountId);
  }, [pointsAccountId]);

  useEffect(() => {
    localStorage.setItem("aiPointCapabilityId", aiPointCapabilityId);
  }, [aiPointCapabilityId]);

  useEffect(() => {
    localStorage.setItem("rewardTreasuryId", rewardTreasuryId);
  }, [rewardTreasuryId]);

  useEffect(() => {
    localStorage.setItem("aiMintCapabilityId", aiMintCapabilityId);
  }, [aiMintCapabilityId]);

  useEffect(() => {
    localStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("lastUserMessageId", lastUserMessageId);
  }, [lastUserMessageId]);

  useEffect(() => {
    localStorage.setItem("lastAiMessageId", lastAiMessageId);
  }, [lastAiMessageId]);

  useEffect(() => {
    localStorage.setItem("chainStatus", chainStatus);
  }, [chainStatus]);

  useEffect(() => {
    localStorage.setItem("redeemTxDigest", redeemTxDigest);
  }, [redeemTxDigest]);

  useEffect(() => {
    localStorage.setItem("rewardObjectId", rewardObjectId);
  }, [rewardObjectId]);

  useEffect(() => {
    if (points !== null) {
      localStorage.setItem("points", String(points));
    }
  }, [points]);

  useEffect(() => {
    localStorage.setItem("exportedHistory", exportedHistory);
  }, [exportedHistory]);

  useEffect(() => {
    localStorage.setItem("badgeRedeemMessage", badgeRedeemMessage);
  }, [badgeRedeemMessage]);

  useEffect(() => {
    localStorage.setItem("badgeObjectId", badgeObjectId);
  }, [badgeObjectId]);

  const fetchCreatedObjectId = async (digest, typeName) => {
    const rpcResponse = await fetch("https://fullnode.testnet.sui.io:443", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "sui_getTransactionBlock",
        params: [
          digest,
          {
            showEffects: true,
            showObjectChanges: true,
          },
        ],
      }),
    });

    const rpcData = await rpcResponse.json();
    console.log("Full transaction block:", rpcData);

    const txBlock = rpcData?.result;
    const createdObj = txBlock?.objectChanges?.find(
      (obj) => obj.type === "created" && obj.objectType?.includes(typeName)
    );

    return createdObj?.objectId || "";
  };

  const exportConversationHistory = async () => {
    if (!connectedWalletAddress) {
      alert("Please connect your Sui wallet first.");
      return;
    }

    if (!conversationId) {
      alert("Please create a conversation first.");
      return;
    }

    if (!localKey) {
      alert("Encryption key not ready yet. Please try again.");
      return;
    }

    try {
      setExportLoading(true);

      const rpcResponse = await fetch("https://fullnode.testnet.sui.io:443", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "sui_getOwnedObjects",
          params: [
            connectedWalletAddress,
            {
              filter: {
                StructType: `${PACKAGE_ID}::conversation::MessageEntry`,
              },
              options: {
                showContent: true,
              },
            },
          ],
        }),
      });

      const rpcData = await rpcResponse.json();
      const objects = rpcData?.result?.data || [];

      const importedKey = await importKey(localKey);
      const history = [];

      for (const entry of objects) {
        const content = entry?.data?.content;
        if (!content || content.dataType !== "moveObject") continue;

        const fields = content.fields || {};
        const convField = fields.conversation_id;
        let convIdValue = "";

        if (typeof convField === "string") {
          convIdValue = convField;
        } else if (convField && typeof convField === "object") {
          convIdValue = convField.id || convField.fields?.id || "";
        }

        const plaintext = await decryptMessage(
          fields.ciphertext || [],
          fields.nonce || [],
          importedKey
        );

        history.push({
          objectId: entry.data.objectId,
          conversationId: convIdValue,
          sender: fields.sender_type === 0 ? "user" : "ai",
          timestamp: Number(fields.timestamp || 0),
          message: plaintext,
        });
      }

      // Sort by timestamp ascending for readability
      history.sort((a, b) => a.timestamp - b.timestamp);

      setExportedHistory(JSON.stringify(history, null, 2));
    } catch (error) {
      console.error("Export history error:", error);
      setExportedHistory("Failed to export history from chain.");
    } finally {
      setExportLoading(false);
    }
  };

  const createConversation = async () => {
    if (!connectedWalletAddress) {
      alert("Please connect your Sui wallet first.");
      return;
    }

    try {
      setCreatingConversation(true);

      const tx = new Transaction();

      const conversation = tx.moveCall({
        target: `${PACKAGE_ID}::conversation::create_conversation`,
        arguments: [],
      });

      tx.transferObjects([conversation], connectedWalletAddress);

      const result = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });

      const digest =
        result?.Transaction?.digest ||
        result?.digest ||
        result?.transactionDigest;

      if (!digest) {
        alert("Conversation created, but digest was not found.");
        return;
      }

      const objectId = await fetchCreatedObjectId(
        digest,
        `${PACKAGE_ID}::conversation::Conversation`
      );

      if (objectId) {
        setConversationId(objectId);
        alert("Conversation created successfully.");
      } else {
        alert("Conversation created, but object ID was not found.");
      }
    } catch (error) {
      console.error("Create conversation error:", error);
      alert("Failed to create conversation.");
    } finally {
      setCreatingConversation(false);
    }
  };

  const createAiCapability = async () => {
    if (!connectedWalletAddress) {
      alert("Please connect your Sui wallet first.");
      return;
    }

    try {
      setCreatingAiCap(true);

      const tx = new Transaction();

      const cap = tx.moveCall({
        target: `${PACKAGE_ID}::conversation::create_ai_capability`,
        arguments: [],
      });

      tx.transferObjects([cap], connectedWalletAddress);

      const result = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });

      const digest =
        result?.Transaction?.digest ||
        result?.digest ||
        result?.transactionDigest;

      if (!digest) {
        alert("AI capability created, but digest was not found.");
        return;
      }

      const objectId = await fetchCreatedObjectId(
        digest,
        `${PACKAGE_ID}::conversation::AiCapability`
      );

      if (objectId) {
        setAiCapabilityId(objectId);
        alert("AI capability created successfully.");
      } else {
        alert("AI capability created, but object ID was not found.");
      }
    } catch (error) {
      console.error("Create AI capability error:", error);
      alert("Failed to create AI capability.");
    } finally {
      setCreatingAiCap(false);
    }
  };

  const createPointsAccount = async () => {
    if (!connectedWalletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      setCreatingPointsAccount(true);

      const tx = new Transaction();

      const pointsAccount = tx.moveCall({
        target: `${PACKAGE_ID}::points::create_points_account`,
        arguments: [],
      });

      tx.transferObjects([pointsAccount], connectedWalletAddress);

      const result = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });

      const digest =
        result?.Transaction?.digest ||
        result?.digest ||
        result?.transactionDigest;

      if (!digest) {
        alert("Points account created, but digest not found.");
        return;
      }

      const objectId = await fetchCreatedObjectId(
        digest,
        `${PACKAGE_ID}::points::PointsAccount`
      );

      if (objectId) {
        setPointsAccountId(objectId);
        alert("Points account created successfully.");
      } else {
        alert("Points account created, but object ID not found.");
      }
    } catch (error) {
      console.error("Create points account error:", error);
      alert("Failed to create points account.");
    } finally {
      setCreatingPointsAccount(false);
    }
  };

  const createAiPointCapability = async () => {
    if (!connectedWalletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      setCreatingAiPointCap(true);

      const tx = new Transaction();

      const cap = tx.moveCall({
        target: `${PACKAGE_ID}::points::create_ai_point_capability`,
        arguments: [],
      });

      tx.transferObjects([cap], connectedWalletAddress);

      const result = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });

      const digest =
        result?.Transaction?.digest ||
        result?.digest ||
        result?.transactionDigest;

      if (!digest) {
        alert("AI point capability created, but digest not found.");
        return;
      }

      const objectId = await fetchCreatedObjectId(
        digest,
        `${PACKAGE_ID}::points::AiPointCapability`
      );

      if (objectId) {
        setAiPointCapabilityId(objectId);
        alert("AI point capability created successfully.");
      } else {
        alert("AI point capability created, but object ID not found.");
      }
    } catch (error) {
      console.error("Create AI point capability error:", error);
      alert("Failed to create AI point capability.");
    } finally {
      setCreatingAiPointCap(false);
    }
  };

  const initRewardTreasury = async () => {
    if (!connectedWalletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      setCreatingRewardTreasury(true);

      const tx = new Transaction();

      const treasury = tx.moveCall({
        target: `${PACKAGE_ID}::reward_token::init_reward_token`,
        arguments: [tx.pure.u64(1000000)],
      });

      tx.transferObjects([treasury], connectedWalletAddress);

      const result = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });

      const digest =
        result?.Transaction?.digest ||
        result?.digest ||
        result?.transactionDigest;

      if (!digest) {
        alert("Reward treasury created, but digest not found.");
        return;
      }

      const objectId = await fetchCreatedObjectId(
        digest,
        `${PACKAGE_ID}::reward_token::RewardTreasury`
      );

      if (objectId) {
        setRewardTreasuryId(objectId);
        alert("Reward treasury created successfully.");
      } else {
        alert("Reward treasury created, but object ID not found.");
      }
    } catch (error) {
      console.error("Init reward treasury error:", error);
      alert("Failed to create reward treasury.");
    } finally {
      setCreatingRewardTreasury(false);
    }
  };

  const createAiMintCapability = async () => {
    if (!connectedWalletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      setCreatingAiMintCap(true);

      const tx = new Transaction();

      const cap = tx.moveCall({
        target: `${PACKAGE_ID}::reward_token::create_ai_mint_capability`,
        arguments: [],
      });

      tx.transferObjects([cap], connectedWalletAddress);

      const result = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });

      const digest =
        result?.Transaction?.digest ||
        result?.digest ||
        result?.transactionDigest;

      if (!digest) {
        alert("AI mint capability created, but digest not found.");
        return;
      }

      const objectId = await fetchCreatedObjectId(
        digest,
        `${PACKAGE_ID}::reward_token::AiMintCapability`
      );

      if (objectId) {
        setAiMintCapabilityId(objectId);
        alert("AI mint capability created successfully.");
      } else {
        alert("AI mint capability created, but object ID not found.");
      }
    } catch (error) {
      console.error("Create AI mint capability error:", error);
      alert("Failed to create AI mint capability.");
    } finally {
      setCreatingAiMintCap(false);
    }
  };

  const awardPointsOnChain = async (earnedPoints, reasonText = "AI engagement reward") => {
    if (
      !connectedWalletAddress ||
      !pointsAccountId ||
      !aiPointCapabilityId ||
      !earnedPoints ||
      earnedPoints <= 0
    ) {
      return;
    }

    const timestamp = Date.now();
    const tx = new Transaction();

    const eventObj = tx.moveCall({
      target: `${PACKAGE_ID}::points::award_points`,
      arguments: [
        tx.object(pointsAccountId),
        tx.object(aiPointCapabilityId),
        tx.pure.u64(earnedPoints),
        tx.pure.vector("u8", textToBytes(reasonText)),
        tx.pure.u64(timestamp),
      ],
    });

    tx.transferObjects([eventObj], connectedWalletAddress);

    const result = await dAppKit.signAndExecuteTransaction({
      transaction: tx,
    });

    console.log("award_points result:", result);
  };

  const storeAiReplyOnChain = async (replyText) => {
    if (!connectedWalletAddress || !conversationId || !localKey || !aiCapabilityId) {
      throw new Error("Missing wallet, conversation, encryption key, or AI capability.");
    }

    const importedKey = await importKey(localKey);
    const encrypted = await encryptMessage(replyText, importedKey);
    const timestamp = Date.now();

    const tx = new Transaction();

    const aiMsgObj = tx.moveCall({
      target: `${PACKAGE_ID}::conversation::append_ai_message`,
      arguments: [
        tx.object(conversationId),
        tx.object(aiCapabilityId),
        tx.pure.vector("u8", encrypted.ciphertext),
        tx.pure.vector("u8", encrypted.nonce),
        tx.pure.u64(timestamp),
      ],
    });

    tx.transferObjects([aiMsgObj], connectedWalletAddress);

    const result = await dAppKit.signAndExecuteTransaction({
      transaction: tx,
    });

    const aiDigest =
      result?.Transaction?.digest ||
      result?.digest ||
      result?.transactionDigest;

    if (aiDigest) {
      const aiMsgId = await fetchCreatedObjectId(
        aiDigest,
        `${PACKAGE_ID}::conversation::MessageEntry`
      );

      if (aiMsgId) {
        setLastAiMessageId(aiMsgId);
        setChainStatus("AI reply stored on-chain.");
      }
    }

    console.log("append_ai_message result:", result);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    if (!connectedWalletAddress) {
      alert("Please connect your Sui wallet first.");
      return;
    }

    if (!conversationId) {
      alert("Please create an on-chain conversation first.");
      return;
    }

    if (!localKey) {
      alert("Encryption key is not ready yet. Please try again.");
      return;
    }

    if (!aiCapabilityId) {
      alert("Please create AI capability first.");
      return;
    }

    const plainMessage = message;

    const userMessage = {
      role: "user",
      content: plainMessage,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      setLoading(true);
      setRedeemMessage("");
      setRedeemTxDigest("");
      setRewardObjectId("");

      const importedKey = await importKey(localKey);
      const encrypted = await encryptMessage(plainMessage, importedKey);
      const timestamp = Date.now();

      const tx = new Transaction();

      const msgObj = tx.moveCall({
        target: `${PACKAGE_ID}::conversation::append_user_message`,
        arguments: [
          tx.object(conversationId),
          tx.pure.vector("u8", encrypted.ciphertext),
          tx.pure.vector("u8", encrypted.nonce),
          tx.pure.u64(timestamp),
        ],
      });

      tx.transferObjects([msgObj], connectedWalletAddress);

      const chainResult = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });

      console.log("append_user_message result:", chainResult);

      const userDigest =
        chainResult?.Transaction?.digest ||
        chainResult?.digest ||
        chainResult?.transactionDigest;

      if (userDigest) {
        const userMsgId = await fetchCreatedObjectId(
          userDigest,
          `${PACKAGE_ID}::conversation::MessageEntry`
        );

        if (userMsgId) {
          setLastUserMessageId(userMsgId);
          setChainStatus("User message stored on-chain.");
        }
      }

      const response = await axios.post("http://localhost:4000/chat", {
        message: plainMessage,
        walletAddress: connectedWalletAddress,
        conversationId,
        chatHistory: messages.slice(-12),
      });

      await storeAiReplyOnChain(response.data.reply);

      if (pointsAccountId && aiPointCapabilityId && response.data.points > 0) {
        await awardPointsOnChain(response.data.points, "AI chat reward");
      }

      const aiMessage = {
        role: "ai",
        content: response.data.reply,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setPoints((prev) => (prev || 0) + (Number(response.data.points) || 0));
      setMessage("");
    } catch (error) {
      console.error("Frontend chat error:", error);

      const errorMessage = {
        role: "ai",
        content: "Failed to get AI reply.",
      };

      setMessages((prev) => [...prev, errorMessage]);
      setPoints(null);
    } finally {
      setLoading(false);
    }
  };

  const redeemPoints = async () => {
    if (!connectedWalletAddress) {
      alert("Please connect your Sui wallet first.");
      return;
    }

    if (!points || points < 5) {
      alert("Need at least 5 points to redeem.");
      return;
    }

    if (!pointsAccountId || !rewardTreasuryId || !aiMintCapabilityId) {
      alert("Please create points account, reward treasury, and AI mint capability first.");
      return;
    }

    try {
      setRedeemLoading(true);
      setRedeemMessage("");
      setRedeemTxDigest("");
      setRewardObjectId("");
      setBadgeRedeemMessage("");
      setBadgeObjectId("");

      const pointsToBurn = points;
      const tokenAmount = Math.max(1, Math.floor(pointsToBurn / 5));

      const tx = new Transaction();
      const timestamp = Date.now();

      const rewardObj = tx.moveCall({
        target: `${PACKAGE_ID}::redeem::redeem_points_for_tokens`,
        arguments: [
          tx.object(pointsAccountId),
          tx.object(rewardTreasuryId),
          tx.object(aiMintCapabilityId),
          tx.pure.u64(pointsToBurn),
          tx.pure.u64(tokenAmount),
          tx.pure.vector("u8", textToBytes("Redeem reward tokens")),
          tx.pure.u64(timestamp),
        ],
      });

      tx.transferObjects([rewardObj], connectedWalletAddress);

      const chainResult = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });

      const digest =
        chainResult?.Transaction?.digest ||
        chainResult?.digest ||
        chainResult?.transactionDigest;

      if (!digest) {
        throw new Error("Redeem transaction digest not found.");
      }

      const mintedRewardObjectId = await fetchCreatedObjectId(
        digest,
        `${PACKAGE_ID}::reward_token::RewardCoin`
      );

      setRedeemMessage(
        `Redeem successful: burned ${pointsToBurn} points and minted ${tokenAmount} reward tokens.`
      );
      setRedeemTxDigest(digest);
      setRewardObjectId(mintedRewardObjectId || "");
      setPoints(0);
    } catch (error) {
      console.error("Redeem error:", error);
      setRedeemMessage("Failed to redeem points.");
    } finally {
      setRedeemLoading(false);
    }
  };

  const redeemPointsForBadge = async () => {
    if (!connectedWalletAddress) {
      alert("Please connect your Sui wallet first.");
      return;
    }

    if (!points || points < 10) {
      alert("Need at least 10 points to redeem a badge.");
      return;
    }

    if (!pointsAccountId) {
      alert("Please create a points account first.");
      return;
    }

    try {
      setRedeemLoading(true);
      setBadgeRedeemMessage("");
      setBadgeObjectId("");

      const pointsToBurn = Math.min(points, 20);
      const tx = new Transaction();
      const timestamp = Date.now();

      const badgeObj = tx.moveCall({
        target: `${PACKAGE_ID}::redeem::redeem_points_for_badge`,
        arguments: [
          tx.object(pointsAccountId),
          tx.pure.u64(pointsToBurn),
          tx.pure.vector("u8", textToBytes("Study streak badge")),
          tx.pure.u64(timestamp),
        ],
      });

      tx.transferObjects([badgeObj], connectedWalletAddress);

      const chainResult = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      });

      const digest =
        chainResult?.Transaction?.digest ||
        chainResult?.digest ||
        chainResult?.transactionDigest;

      const badgeId = digest
        ? await fetchCreatedObjectId(digest, `${PACKAGE_ID}::redeem::StudyBadge`)
        : "";

      setBadgeRedeemMessage(
        `Redeemed ${pointsToBurn} points for a Study Badge.`
      );
      setBadgeObjectId(badgeId || "");
      setPoints(points - pointsToBurn);
    } catch (error) {
      console.error("Redeem badge error:", error);
      setBadgeRedeemMessage("Failed to redeem badge.");
    } finally {
      setRedeemLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setMessage("");
    setPoints(null);
    setRedeemMessage("");
    setRedeemTxDigest("");
    setRewardObjectId("");
    setLastUserMessageId("");
    setLastAiMessageId("");
    setChainStatus("");
    setExportedHistory("");
    setBadgeRedeemMessage("");
    setBadgeObjectId("");
    localStorage.removeItem("messages");
    localStorage.removeItem("points");
    localStorage.removeItem("lastUserMessageId");
    localStorage.removeItem("lastAiMessageId");
    localStorage.removeItem("chainStatus");
    localStorage.removeItem("redeemTxDigest");
    localStorage.removeItem("rewardObjectId");
    localStorage.removeItem("exportedHistory");
    localStorage.removeItem("badgeRedeemMessage");
    localStorage.removeItem("badgeObjectId");
  };

  const totalMessages = messages.length;
  const totalUserMessages = messages.filter((m) => m.role === "user").length;
  const totalAiMessages = messages.filter((m) => m.role === "ai").length;

  const glassCard =
    "rounded-3xl border border-slate-200/10 bg-slate-900/70 shadow-[0_22px_55px_rgba(2,6,23,0.65)] backdrop-blur-xl";

  const inputBase =
    "w-full rounded-2xl border border-slate-300/20 bg-slate-900/80 px-4 py-3.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-4 focus:ring-cyan-400/20";

  const actionButton =
    "w-full rounded-2xl px-5 py-3.5 text-base font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#081120_0%,#0f172a_45%,#111827_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl"></div>
      <div className="pointer-events-none absolute -right-24 top-8 h-80 w-80 rounded-full bg-emerald-500/25 blur-3xl"></div>
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl"></div>

      <main className="relative z-10 mx-auto grid w-full max-w-7xl gap-6">
        <section className={`${glassCard} p-6 sm:p-8`}>
          <div className="mb-4 inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            AI Rewards Chat
          </div>
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            AI Chat Dashboard
          </h1>
          <p className="max-w-3xl text-base leading-7 text-slate-300">
            Ask questions, get AI responses, earn points, and redeem them in a
            polished blockchain-ready experience.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2.1fr_1fr]">
          <div className="grid gap-6">
            <section className={`${glassCard} p-6 sm:p-7`}>
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Start a Conversation
                  </h2>
                  <p className="mt-1 text-slate-400">
                    Connected to your Gemini-powered backend
                  </p>
                </div>

                <div className="flex flex-wrap justify-end gap-2.5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_#34d399]"></span>
                    Backend Live
                  </div>

                  <button
                    className="rounded-xl border border-slate-300/25 bg-slate-900/80 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-slate-200/40"
                    onClick={clearChat}
                  >
                    Clear Chat
                  </button>
                </div>
              </div>

              <div className="mb-5 grid gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                      Wallet Connection
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Connect your Sui wallet to chat and redeem
                    </p>
                  </div>

                  <ConnectButton />
                </div>

                <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
                    Connected Wallet
                  </p>
                  <p className="break-all text-sm text-slate-100">
                    {connectedWalletAddress || "No wallet connected"}
                  </p>
                </div>

                <button
                  className={`${actionButton} bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-[0_14px_30px_rgba(79,70,229,0.35)]`}
                  onClick={createConversation}
                  disabled={!connectedWalletAddress || creatingConversation}
                >
                  {creatingConversation
                    ? "Creating Conversation..."
                    : "Create On-Chain Conversation"}
                </button>

                <button
                  className={`${actionButton} bg-gradient-to-r from-fuchsia-500 to-pink-500 shadow-[0_14px_30px_rgba(217,70,239,0.35)]`}
                  onClick={createAiCapability}
                  disabled={!connectedWalletAddress || creatingAiCap}
                >
                  {creatingAiCap
                    ? "Creating AI Capability..."
                    : "Create AI Capability"}
                </button>

                <button
                  className={`${actionButton} bg-gradient-to-r from-violet-500 to-indigo-500 shadow-[0_14px_30px_rgba(99,102,241,0.35)]`}
                  onClick={createPointsAccount}
                  disabled={!connectedWalletAddress || creatingPointsAccount}
                >
                  {creatingPointsAccount
                    ? "Creating Points Account..."
                    : "Create Points Account"}
                </button>

                <button
                  className={`${actionButton} bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_14px_30px_rgba(245,158,11,0.35)]`}
                  onClick={createAiPointCapability}
                  disabled={!connectedWalletAddress || creatingAiPointCap}
                >
                  {creatingAiPointCap
                    ? "Creating AI Point Capability..."
                    : "Create AI Point Capability"}
                </button>

                <button
                  className={`${actionButton} bg-gradient-to-r from-emerald-500 to-lime-500 shadow-[0_14px_30px_rgba(16,185,129,0.35)]`}
                  onClick={initRewardTreasury}
                  disabled={!connectedWalletAddress || creatingRewardTreasury}
                >
                  {creatingRewardTreasury
                    ? "Initializing Reward Treasury..."
                    : "Init Reward Treasury"}
                </button>

                <button
                  className={`${actionButton} bg-gradient-to-r from-rose-500 to-red-500 shadow-[0_14px_30px_rgba(244,63,94,0.35)]`}
                  onClick={createAiMintCapability}
                  disabled={!connectedWalletAddress || creatingAiMintCap}
                >
                  {creatingAiMintCap
                    ? "Creating AI Mint Capability..."
                    : "Create AI Mint Capability"}
                </button>

                <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
                    Conversation Status
                  </p>
                  <p className="break-all text-sm text-slate-100">
                    {conversationId || "No conversation created yet"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                      Export On-Chain History
                    </p>
                    <button
                      className="rounded-xl border border-cyan-300/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200/70 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={exportConversationHistory}
                      disabled={exportLoading || !connectedWalletAddress || !conversationId}
                    >
                      {exportLoading ? "Exporting..." : "Export"}
                    </button>
                  </div>
                  <p className="mb-2 text-xs font-semibold text-slate-400">
                    Decrypts and exports all on-chain messages for this conversation.
                  </p>
                  <textarea
                    rows="6"
                    value={exportedHistory}
                    readOnly
                    placeholder="Exported history will appear here as JSON after you click Export."
                    className={`${inputBase} mt-1 resize-y text-xs`}
                  />
                </div>

                <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
                    AI Capability Status
                  </p>
                  <p className="break-all text-sm text-slate-100">
                    {aiCapabilityId || "No AI capability created yet"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
                    Points Account ID
                  </p>
                  <p className="break-all text-sm text-slate-100">
                    {pointsAccountId || "No points account created yet"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
                    AI Point Capability ID
                  </p>
                  <p className="break-all text-sm text-slate-100">
                    {aiPointCapabilityId || "No AI point capability created yet"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
                    Reward Treasury ID
                  </p>
                  <p className="break-all text-sm text-slate-100">
                    {rewardTreasuryId || "No reward treasury created yet"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
                    AI Mint Capability ID
                  </p>
                  <p className="break-all text-sm text-slate-100">
                    {aiMintCapabilityId || "No AI mint capability created yet"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-300/15 bg-slate-900/70 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
                    On-Chain Message Status
                  </p>
                  <p className="mb-2 text-sm text-emerald-300">
                    {chainStatus || "No message stored yet"}
                  </p>

                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-cyan-200">
                    Last User Message ID
                  </p>
                  <p className="mb-3 break-all text-sm text-slate-100">
                    {lastUserMessageId || "No user message yet"}
                  </p>

                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-cyan-200">
                    Last AI Message ID
                  </p>
                  <p className="break-all text-sm text-slate-100">
                    {lastAiMessageId || "No AI message yet"}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Your Message
                </label>
                <textarea
                  rows="5"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask something about blockchain, AI, rewards, or your project..."
                  className={`${inputBase} resize-y`}
                />
              </div>

              <button
                className={`${actionButton} bg-gradient-to-r from-cyan-500 to-emerald-500 shadow-[0_14px_30px_rgba(6,182,212,0.35)]`}
                onClick={sendMessage}
                disabled={
                  loading ||
                  !connectedWalletAddress ||
                  !conversationId ||
                  !aiCapabilityId
                }
              >
                {loading ? "Generating..." : "Send Message"}
              </button>
            </section>

            <section className={`${glassCard} p-6 sm:p-7`}>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/15 text-lg text-cyan-200">
                  ✦
                </span>
                <h3 className="text-xl font-bold text-white">Chat History</h3>
              </div>

              <div className="flex flex-col gap-3.5">
                {messages.length === 0 ? (
                  <p className="text-slate-400">
                    No messages yet. Connect your wallet and start your first
                    conversation.
                  </p>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3.5 leading-7 ${
                          msg.role === "user"
                            ? "rounded-br-md border border-cyan-300/30 bg-cyan-500/15"
                            : "rounded-bl-md border border-slate-300/20 bg-slate-900/85"
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-wide text-cyan-200">
                          {msg.role === "user" ? "You" : "AI"}
                        </span>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-200 sm:text-base">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="grid gap-6">
            <section className={`${glassCard} flex flex-col justify-center p-6 sm:p-7`}>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/15 text-lg text-cyan-200">
                  ⟡
                </span>
                <h3 className="text-xl font-bold text-white">Points Earned</h3>
              </div>

              <div className="mb-2 text-5xl font-extrabold leading-none text-white">
                {points !== null ? points : "--"}
              </div>

              <p className="mb-5 text-slate-400">
                {points !== null
                  ? points >= 5
                    ? "You can redeem now"
                    : "Need at least 5 points to redeem"
                  : "No points yet"}
              </p>

              <button
                className={`${actionButton} bg-gradient-to-r from-sky-500 to-emerald-500 shadow-[0_14px_30px_rgba(16,185,129,0.3)]`}
                onClick={redeemPoints}
                disabled={
                  redeemLoading ||
                  !connectedWalletAddress ||
                  points === null ||
                  points < 5
                }
              >
                {redeemLoading ? "Redeeming..." : "Redeem Points"}
              </button>

              <button
                className={`${actionButton} mt-3 bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_14px_30px_rgba(129,140,248,0.3)]`}
                onClick={redeemPointsForBadge}
                disabled={
                  redeemLoading ||
                  !connectedWalletAddress ||
                  points === null ||
                  points < 10
                }
              >
                {redeemLoading ? "Redeeming..." : "Redeem for Study Badge"}
              </button>

              {redeemMessage && (
                <div className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-200">
                  {redeemMessage}
                </div>
              )}

              {redeemTxDigest && (
                <div className="mt-3 rounded-xl border border-cyan-300/20 bg-slate-900/70 px-4 py-3">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-cyan-200">
                    Redeem Tx Digest
                  </p>
                  <p className="break-all text-sm text-slate-100">
                    {redeemTxDigest}
                  </p>
                </div>
              )}

              {rewardObjectId && (
                <div className="mt-3 rounded-xl border border-cyan-300/20 bg-slate-900/70 px-4 py-3">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-cyan-200">
                    Reward Object ID
                  </p>
                  <p className="break-all text-sm text-slate-100">
                    {rewardObjectId}
                  </p>
                </div>
              )}

              {badgeRedeemMessage && (
                <div className="mt-3 rounded-xl border border-violet-300/30 bg-violet-500/10 px-4 py-3 text-sm leading-6 text-violet-200">
                  {badgeRedeemMessage}
                </div>
              )}

              {badgeObjectId && (
                <div className="mt-3 rounded-xl border border-violet-300/20 bg-slate-900/70 px-4 py-3">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-cyan-200">
                    Study Badge Object ID
                  </p>
                  <p className="break-all text-sm text-slate-100">
                    {badgeObjectId}
                  </p>
                </div>
              )}
            </section>

            <section className={`${glassCard} p-6 sm:p-7`}>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/15 text-lg text-cyan-200">
                  ☰
                </span>
                <h3 className="text-xl font-bold text-white">Session Stats</h3>
              </div>

              <div className="flex items-center justify-between border-b border-slate-300/15 py-3 text-slate-300">
                <span>Total Messages</span>
                <strong className="text-white">{totalMessages}</strong>
              </div>

              <div className="flex items-center justify-between border-b border-slate-300/15 py-3 text-slate-300">
                <span>User Messages</span>
                <strong className="text-white">{totalUserMessages}</strong>
              </div>

              <div className="flex items-center justify-between border-b border-slate-300/15 py-3 text-slate-300">
                <span>AI Messages</span>
                <strong className="text-white">{totalAiMessages}</strong>
              </div>

              <div className="flex items-center justify-between py-3 text-slate-300">
                <span>Wallet</span>
                <strong className="max-w-40 break-all text-right text-white">
                  {connectedWalletAddress || "Not connected"}
                </strong>
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default App;