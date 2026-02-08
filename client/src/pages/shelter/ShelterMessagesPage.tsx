import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { ShelterSidebar } from "../../components/layout/ShelterSidebar";
import { HamburgerMenu } from "../../components/layout/HamburgerMenu";
import { NotificationCenter } from "../../components/common/NotificationCenter";
import { ConversationList } from "../../components/messaging/ConversationList";
import { ChatWindow } from "../../components/messaging/ChatWindow";
import { useAuth } from "../../contexts/AuthContext";

export function ShelterMessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const { user } = useAuth();

  useEffect(() => {
    const convId = searchParams.get("conversationId");
    if (convId) {
      setSelectedConversationId(convId);
    }
  }, [searchParams]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setSearchParams({ conversationId: id });
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <ShelterSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <HamburgerMenu />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-500">Communicate with adopters</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />

            {/* Profile Avatar */}
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
              {(user?.name || "S")
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </div>
          </div>
        </header>

        {/* Main Content - Messages Area */}
        <main className="flex-1 p-6 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden h-[calc(100vh-140px)] flex">
            {/* Sidebar - Conversation List */}
            <div
              className={`${
                selectedConversationId ? "hidden md:flex" : "flex"
              } w-full md:w-80 lg:w-96 flex-col border-r border-[var(--color-border)]`}
            >
              <div className="p-4 border-b border-[var(--color-border)] bg-gray-50">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[var(--color-primary)]" />
                  <h2 className="text-lg font-bold text-[var(--color-text)]">
                    Conversations
                  </h2>
                </div>
              </div>
              <ConversationList
                selectedId={selectedConversationId}
                onSelect={handleSelectConversation}
              />
            </div>

            {/* Main - Chat Window */}
            <div
              className={`${
                !selectedConversationId ? "hidden md:flex" : "flex"
              } flex-1 flex-col bg-[var(--color-surface)]`}
            >
              {selectedConversationId ? (
                <ChatWindow
                  conversationId={selectedConversationId}
                  onBack={() => setSelectedConversationId(null)}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center flex-col text-[var(--color-text-light)] p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <MessageSquare className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    Choose a chat from the list to start messaging with
                    potential adopters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}



