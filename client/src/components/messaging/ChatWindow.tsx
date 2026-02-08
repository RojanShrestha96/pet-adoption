import { useEffect, useState, useRef } from "react";
import { Send, ArrowLeft, MessageCircle, Trash2 } from "lucide-react";
import { useSocket } from "../../contexts/SocketContext";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";
import { ConfirmationDialog } from "../common/ConfirmationDialog";

interface Message {
  _id: string;
  text: string;
  sender: string | { _id: string; name?: string };
  createdAt: string;
}

interface ChatWindowProps {
  conversationId: string;
  onBack: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  onBack,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { user, token } = useAuth();
  const { socket } = useSocket();

  // Get user initials (e.g., "RS" for "Rojan Shrestha")
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Fetch conversation to get other user info
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch conversations to get participant info
        const convRes = await fetch(
          "http://localhost:5000/api/messages/conversations",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (convRes.ok) {
          const conversations = await convRes.json();
          const currentConv = conversations.find(
            (c: any) => c._id === conversationId
          );

          if (currentConv) {
            // Find the other participant - convert to string for reliable comparison
            const currentUserId = String(user?._id || user?.id);
            const other = currentConv.participants?.find(
              (p: any) => String(p._id) !== currentUserId
            );
            setOtherUser(other);
          }
        }

        // Fetch messages
        const msgRes = await fetch(
          `http://localhost:5000/api/messages/${conversationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (msgRes.ok) {
          setMessages(await msgRes.json());
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    if (token && conversationId) fetchData();
  }, [conversationId, token, user?._id, user?.id]);

  // Socket Listeners
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("join_conversation", conversationId);

    // Handle receiving messages
    const handleReceiveMessage = (msg: any) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
        // Clear typing indicator when message is received
        setIsTyping(false);
        setTypingUser("");
      }
    };

    // Handle typing indicator
    const handleTyping = (data: {
      userId: string;
      userName: string;
      conversationId: string;
    }) => {
      const currentUserId = user?._id || user?.id;
      if (
        data.conversationId === conversationId &&
        data.userId !== currentUserId
      ) {
        setIsTyping(true);
        setTypingUser(data.userName);

        // Clear typing after 3 seconds
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          setTypingUser("");
        }, 3000);
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("user_typing", handleTyping);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("user_typing", handleTyping);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, conversationId, user?._id, user?.id]);

  // Emit typing event
  const handleTyping = () => {
    if (socket && user) {
      socket.emit("typing", {
        conversationId,
        userId: user._id,
        userName: user.name,
      });
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId,
          text: newMessage,
        }),
      });

      if (res.ok) {
        const savedMsg = await res.json();
        setMessages((prev) => [...prev, savedMsg]);
        setNewMessage("");
      }
    } catch (err) {
      console.error("Failed to send", err);
    }
  };

  const handleDeleteConversation = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/messages/conversations/${conversationId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        onBack(); // Go back to list
      }
    } catch (err) {
      console.error("Failed to delete conversation", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div
        className="p-4 border-b bg-[var(--color-card)] flex items-center justify-between"
        style={{
          borderColor: "var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors"
            style={{ color: "var(--color-text-light)" }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {/* Message Icon - uses theme primary color */}
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
              }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold" style={{ color: "var(--color-text)" }}>
                {otherUser?.name || "Chat"}
              </h3>
              <span
                className="text-xs flex items-center gap-1"
                style={{ color: "var(--color-success)" }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "var(--color-success)" }}
                ></span>{" "}
                Online
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
          title="Delete Conversation"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConversation}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 md:p-6"
        style={{
          background:
            "linear-gradient(180deg, var(--color-surface) 0%, var(--color-background) 100%)",
        }}
      >
        {messages.length === 0 ? (
          <div
            className="flex items-center justify-center h-full text-center"
            style={{ color: "var(--color-text-light)" }}
          >
            <div
              className="p-8 rounded-2xl backdrop-blur-sm"
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-surface) 0%, var(--color-border) 100%)",
                }}
              >
                <MessageCircle
                  className="w-10 h-10"
                  style={{ color: "var(--color-primary)" }}
                />
              </div>
              <p
                className="text-base font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                No messages yet
              </p>
              <p
                className="text-sm mt-2"
                style={{ color: "var(--color-text-light)" }}
              >
                Send a message to start the conversation
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((msg, index) => {
              // Check both _id and id since auth context may use either
              const currentUserId = user?._id || user?.id;
              // Convert both to strings for proper comparison
              const senderId =
                typeof msg.sender === "object" ? msg.sender._id : msg.sender;
              const isMe = String(senderId) === String(currentUserId);
              const senderName = isMe
                ? user?.name || "You"
                : otherUser?.name || "User";
              const senderInitials = getInitials(senderName);

              return (
                <div
                  key={msg._id || index}
                  className={`flex w-full ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-2.5 max-w-[80%] md:max-w-[65%] ${
                      isMe ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar with initials - uses theme colors */}
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-md text-white"
                      style={{
                        background: isMe
                          ? "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)"
                          : "linear-gradient(135deg, var(--color-secondary) 0%, var(--color-text-light) 100%)",
                        boxShadow: "var(--shadow-md)",
                      }}
                    >
                      {senderInitials}
                    </div>

                    <div
                      className={`flex flex-col ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Sender name */}
                      <span
                        className="text-xs font-semibold mb-1 px-1"
                        style={{
                          color: isMe
                            ? "var(--color-primary)"
                            : "var(--color-text)",
                        }}
                      >
                        {senderName}
                      </span>

                      {/* Message Bubble - uses theme colors */}
                      <div
                        className="px-4 py-3 rounded-2xl break-words max-w-full"
                        style={{
                          background: isMe
                            ? "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)"
                            : "var(--color-card)",
                          color: isMe ? "white" : "var(--color-text)",
                          border: isMe
                            ? "none"
                            : "1px solid var(--color-border)",
                          borderTopLeftRadius: isMe ? "16px" : "4px",
                          borderTopRightRadius: isMe ? "4px" : "16px",
                          boxShadow: "var(--shadow-md)",
                        }}
                      >
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <span
                        className="text-[10px] mt-1.5 px-1"
                        style={{
                          color: isMe
                            ? "var(--color-primary)"
                            : "var(--color-text-light)",
                        }}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && typingUser && (
          <div className="flex items-center gap-2.5 mt-4">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-secondary) 0%, var(--color-text-light) 100%)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              {getInitials(typingUser)}
            </div>
            <div className="flex flex-col items-start">
              <span
                className="text-xs font-semibold mb-1 px-1"
                style={{ color: "var(--color-text)" }}
              >
                {typingUser}
              </span>
              <div
                className="rounded-2xl px-4 py-3"
                style={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-md)",
                  borderTopLeftRadius: "4px",
                }}
              >
                <div className="flex gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: "var(--color-text-light)",
                      animationDelay: "0ms",
                    }}
                  ></span>
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: "var(--color-text-light)",
                      animationDelay: "150ms",
                    }}
                  ></span>
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: "var(--color-text-light)",
                      animationDelay: "300ms",
                    }}
                  ></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="p-4"
        style={{
          background: "var(--color-card)",
          borderTop: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl transition-all focus:outline-none"
            style={{
              background: "var(--color-surface)",
              border: "2px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          />
          <Button
            variant="primary"
            className="rounded-xl px-5"
            onClick={handleSend}
            disabled={!newMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
