import { useEffect, useState } from "react";
import axios from "axios";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { Transaction } from "@mysten/sui/transactions";
import HeaderSection from "./components/HeaderSection";
import StartConversationCard from "./components/StartConversationCard";
import ChatHistoryCard from "./components/ChatHistoryCard";
import PointsPanel from "./components/PointsPanel";
import SessionStatsPanel from "./components/SessionStatsPanel";

const PACKAGE_ID =
  "0x8b04f9641055ae0aaf75710200dfe440db8f0b61b38864c149d9a0168df4bf3f";

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
              // No StructType filter here; we filter by type in code to be
              // resilient to type-string variations between clients.
              options: {
                showContent: true,
                showType: true,
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

        const objType = content.type || entry?.data?.type || "";
        if (!objType.includes("::conversation::MessageEntry")) continue;

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

      // Fallback: if nothing was found via sui_getOwnedObjects, try the
      // last known user/AI message IDs directly so that export still
      // surfaces something for the current session.
      if (history.length === 0) {
        const directIds = [lastUserMessageId, lastAiMessageId].filter(Boolean);

        for (const id of directIds) {
          try {
            const objResp = await fetch("https://fullnode.testnet.sui.io:443", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "sui_getObject",
                params: [
                  id,
                  {
                    showContent: true,
                  },
                ],
              }),
            });

            const objJson = await objResp.json();
            const objData = objJson?.result?.data;
            const content = objData?.content;
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
              objectId: objData.objectId,
              conversationId: convIdValue,
              sender: fields.sender_type === 0 ? "user" : "ai",
              timestamp: Number(fields.timestamp || 0),
              message: plaintext,
            });
          } catch (e) {
            console.error("Direct fetch of message object failed", e);
          }
        }
      }

      // Sort by timestamp ascending for readability
      history.sort((a, b) => a.timestamp - b.timestamp);

      if (history.length === 0) {
        setExportedHistory(
          JSON.stringify(
            {
              message:
                "No on-chain messages found for this wallet. Try sending a new message and exporting again.",
              entries: [],
            },
            null,
            2
          )
        );
      } else {
        setExportedHistory(JSON.stringify(history, null, 2));
      }
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
        <HeaderSection glassCard={glassCard} />

        <section className="grid gap-6 lg:grid-cols-[2.1fr_1fr]">
          <div className="grid gap-6">
            <StartConversationCard
              glassCard={glassCard}
              inputBase={inputBase}
              actionButton={actionButton}
              connectedWalletAddress={connectedWalletAddress}
              clearChat={clearChat}
              createConversation={createConversation}
              creatingConversation={creatingConversation}
              createAiCapability={createAiCapability}
              creatingAiCap={creatingAiCap}
              createPointsAccount={createPointsAccount}
              creatingPointsAccount={creatingPointsAccount}
              createAiPointCapability={createAiPointCapability}
              creatingAiPointCap={creatingAiPointCap}
              initRewardTreasury={initRewardTreasury}
              creatingRewardTreasury={creatingRewardTreasury}
              createAiMintCapability={createAiMintCapability}
              creatingAiMintCap={creatingAiMintCap}
              conversationId={conversationId}
              exportConversationHistory={exportConversationHistory}
              exportLoading={exportLoading}
              exportedHistory={exportedHistory}
              aiCapabilityId={aiCapabilityId}
              pointsAccountId={pointsAccountId}
              aiPointCapabilityId={aiPointCapabilityId}
              rewardTreasuryId={rewardTreasuryId}
              aiMintCapabilityId={aiMintCapabilityId}
              chainStatus={chainStatus}
              lastUserMessageId={lastUserMessageId}
              lastAiMessageId={lastAiMessageId}
              message={message}
              setMessage={setMessage}
              sendMessage={sendMessage}
              loading={loading}
            />

            <ChatHistoryCard glassCard={glassCard} messages={messages} />
          </div>

          <aside className="grid gap-6">
            <PointsPanel
              glassCard={glassCard}
              actionButton={actionButton}
              points={points}
              redeemPoints={redeemPoints}
              redeemPointsForBadge={redeemPointsForBadge}
              redeemLoading={redeemLoading}
              redeemMessage={redeemMessage}
              redeemTxDigest={redeemTxDigest}
              rewardObjectId={rewardObjectId}
              badgeRedeemMessage={badgeRedeemMessage}
              badgeObjectId={badgeObjectId}
              connectedWalletAddress={connectedWalletAddress}
            />

            <SessionStatsPanel
              glassCard={glassCard}
              totalMessages={totalMessages}
              totalUserMessages={totalUserMessages}
              totalAiMessages={totalAiMessages}
              connectedWalletAddress={connectedWalletAddress}
            />
          </aside>
        </section>
      </main>
    </div>
  );
}

export default App;