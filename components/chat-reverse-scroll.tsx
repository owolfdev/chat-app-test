"use client";
import React, { useState, useRef, useEffect } from "react";

import { useUser } from "@/lib/UserContext";

type ChatMessage = {
  chat_id: string;
  content: string;
  id: string;
  sender_id: string;
  sent_at: string;
  updated_at: string;
};

function ChatReverseScroll({ supabase }: { supabase: any }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const bottomRef = useRef<null | HTMLDivElement>(null);

  //
  const [data, setData] = useState<ChatMessage[]>([]);
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  const [newMessage, setNewMessage] = useState<string>("");
  const [chatId, setChatId] = useState<string>(
    "4113f429-c4ad-42aa-b43f-0a2bcafaeaa5"
  );
  const userContext = useUser();

  const user = userContext ? userContext.user : null;

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    setMessages(data.map((item) => item));
    loadAvatars();
  }, [data]);

  const getData = async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select()
      .eq("chat_id", chatId);
    if (data) {
      setData(data);
    }

    return data;
  };

  const loadAvatars = async () => {
    const senderIds = Array.from(new Set(data.map((item) => item.sender_id)));
    for (let id of senderIds) {
      const { data } = await supabase
        .from("profiles")
        .select("avatar")
        .eq("user_id", id);
      if (data && data.length > 0) {
        setAvatars((prevAvatars) => ({
          ...prevAvatars,
          [id]: data[0].avatar,
        }));
      }
    }
  };

  //   const sendMessage = async (e: any, newMessage:any) => {
  //     e.preventDefault();
  //     console.log("send message:", user?.id, newMessage);
  //     const { data, error } = await supabase
  //       .from("chat_messages")
  //       .insert({
  //         sender_id: user?.id,
  //         content: newMessage,
  //         chat_id: chatId,
  //       })
  //       .single();
  //   };

  const handleSend = async () => {
    if (currentMessage.trim() !== "" && user?.id) {
      // Ensure user.id is defined
      const formattedMessage = {
        chat_id: chatId,
        content: currentMessage.trim(),
        sender_id: user.id, // No need for optional chaining here, we ensured it's defined
        id: Date.now().toString(),
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          sender_id: user?.id,
          content: formattedMessage.content,
          chat_id: chatId,
        })
        .single();
      //   setMessages((prevMessages) => [...prevMessages, formattedMessage]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    if (data) {
      setData(data);
    }

    const channel = supabase
      .channel("schema-db-changes-reverse-scroll")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload: any) => setData((messages) => [...messages, payload.new])
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [data]);

  // Scroll to bottom whenever the messages array changes
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="border border-gray-300 rounded-lg p-4 w-full max-w-md">
      <div className="overflow-y-auto h-64 mb-4 border-b border-gray-200 pb-4">
        {messages.map((message, index) => (
          <div key={index} className="mb-2 last:mb-0">
            {message.content}
          </div>
        ))}
        {/* This is an invisible div, acting as a marker to scroll to */}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center">
        <input
          type="text"
          className="border rounded-l p-2 flex-1"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 rounded-r bg-blue-500 text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatReverseScroll;
