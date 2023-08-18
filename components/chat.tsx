"use client";
import React, { useState, useRef, useEffect } from "react";

import { Alert } from "@/components/alert";

import { useUser } from "@/lib/UserContext";

type ChatMessage = {
  chat_id: string;
  content: string;
  id: string;
  sender_id: string;
  sent_at: string;
  updated_at: string;
};

const deleteChat_AlertMessage = "Are you sure you want to delete this message?";

function Chat({ supabase }: { supabase: any }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  const bottomRef = useRef<null | HTMLDivElement>(null);
  const [chatId, setChatId] = useState<string>(
    "4113f429-c4ad-42aa-b43f-0a2bcafaeaa5"
  );

  const userContextValue = useUser();
  const user = userContextValue ? userContextValue.user : null;
  const userId = user?.id;

  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getData();
      if (data) setAvatarsBySenderIds(data);
    }
    fetchData();
  }, []);

  const getData = async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select()
      .eq("chat_id", chatId);
    if (data) {
      setMessages(data);
    }
    return data;
  };

  const setAvatarsBySenderIds = async (messages: ChatMessage[]) => {
    const senderIds = Array.from(
      new Set(messages.map((item) => item.sender_id))
    );
    let avatarsObj: Record<string, string> = {};
    for (let id of senderIds) {
      const { data } = await supabase
        .from("profiles")
        .select("avatar")
        .eq("user_id", id);
      if (data && data.length > 0) {
        avatarsObj[id] = data[0].avatar;
      }
    }
    setAvatars(avatarsObj);
  };

  const handleSend = async (e: any) => {
    e.preventDefault();
    if (currentMessage.trim() !== "" && userId) {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          sender_id: userId,
          content: currentMessage.trim(),
          chat_id: chatId,
        })
        .single()
        .select("*");

      if (error) {
        console.log(error);
      } else {
        // console.log(data);
        setCurrentMessage("");
      }
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel(`schema-db-changes-for-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload: any) => setMessages((messages) => [...messages, payload.new])
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "chat_messages",
        },
        (payload: any) => {
          // console.log("delete payload", payload);
          setMessages((messages) =>
            messages.filter((msg) => msg.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Scroll to bottom whenever the messages array changes
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleDeleteMessage = async (id: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .delete()
      .eq("id", id);
    if (!error) {
      // setMessages((prevMessages) =>
      //   prevMessages.filter((msg) => msg.id !== id)
      // );
    }
  };

  return (
    <div>
      <div className="border border-gray-300 rounded-lg w-full  p-4 ">
        <div className="overflow-y-auto h-64 mb-4 border rounded lg border-gray-200 pb-4 px-4">
          {messages.map((item) => (
            <div
              key={item.id}
              className={`w-full mb-2 flex items-start ${
                userId === item.sender_id ? "justify-end" : "justify-start"
              }`}
              onMouseEnter={() => setHoveredMessageId(item.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              <div
                style={{ maxWidth: "75%" }}
                className="flex gap-1 items-end relative"
              >
                {userId !== item.sender_id && (
                  <div className="w-6 h-6 bg-cover bg-center rounded-full overflow-hidden flex-shrink-0">
                    <img src={avatars[item.sender_id] || ""} />
                  </div>
                )}
                <div>
                  <div className="text-[11px] text-gray-300 pr-3 pl-3 text-right">
                    {new Date(item.sent_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
                  </div>
                  <div
                    className={`${
                      userId === item.sender_id
                        ? "bg-gray-600 text-white"
                        : "bg-gray-300 text-black"
                    } rounded-2xl px-3 py-2 break-words text-sm`}
                  >
                    {userId === item.sender_id &&
                      hoveredMessageId === item.id && (
                        <Alert
                          action={handleDeleteMessage}
                          item={item.id}
                          message={deleteChat_AlertMessage}
                          title="Delete Message"
                        />
                      )}
                    {item.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* This is an invisible div, acting as a marker to scroll to */}
          <div ref={bottomRef} />
        </div>
        <form action="" onSubmit={handleSend}>
          <div className="flex items-center">
            <input
              type="text"
              className="border rounded-l p-2 flex-1 outline-gray-400"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type a message..."
            />

            <button
              type="submit"
              // onClick={handleSend}
              className="px-4 py-2 rounded-r border border-black bg-black text-white"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Chat;
