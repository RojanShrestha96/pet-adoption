import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "../../components/layout/Navbar";
import { ConversationList } from "../../components/messaging/ConversationList";
import { ChatWindow } from "../../components/messaging/ChatWindow";

export function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

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
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)]">
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden h-full flex mt-6">
          {/* Sidebar - Conversation List */}
          <div
            className={`${
              selectedConversationId ? "hidden md:flex" : "flex"
            } w-full md:w-80 lg:w-96 flex-col border-r border-[var(--color-border)]`}
          >
            <div className="p-4 border-b border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text)]">
                Messages
              </h2>
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
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-3xl">
                  💬
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Select a conversation
                </h3>
                <p>Choose a chat from the left to start messaging.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}



