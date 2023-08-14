"use client";

import React, { useState, useEffect, use } from "react";

import { Alert } from "@/components/alert";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useUser } from "@/lib/UserContext";

type ChatMessage = {
  chat_id: string;
  content: string;
  id: string;
  sender_id: string;
  sent_at: string;
  updated_at: string;
};

const deleteChatMessage_AlertMessage =
  "Are you sure you want to delete this message?";

export function Chat({ supabase }: { supabase: any }) {
  const [data, setData] = useState<ChatMessage[]>([]);
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  const [newMessage, setNewMessage] = useState<string>("");
  const [chatId, setChatId] = useState<string>(
    "4113f429-c4ad-42aa-b43f-0a2bcafaeaa5"
  );
  const userContext = useUser();

  const user = userContext ? userContext.user : null;

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

  useEffect(() => {}, [newMessage]);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    loadAvatars();
  }, [data]);

  const handleSendMessage = async (e: any) => {
    e.preventDefault();
    console.log("send message:", user?.id, newMessage);
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        sender_id: user?.id,
        content: newMessage,
        chat_id: chatId,
      })
      .single();

    setNewMessage("");
  };

  useEffect(() => {
    if (data) {
      setData(data);
    }

    const channel = supabase
      .channel("schema-db-changes")
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

  const ChatView = ({ data }: { data: ChatMessage[] }) => {
    const userContext = useUser();
    const userId = userContext ? userContext.user?.id : null;
    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(
      null
    );

    const sortedData = [...data].sort(
      (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
    );

    const handleDeleteMessage = async (id: string) => {
      const { data, error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting message", error);
      } else {
        getData();
      }
    };

    return (
      <div className="w-full border rounded-lg h-[400px] overflow-y-scroll p-4 flex flex-col">
        {sortedData.map((item, index) => (
          <div
            key={index}
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
                        message={deleteChatMessage_AlertMessage}
                        title="Delete Message"
                      />
                    )}
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full mx-auto ">
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        {user ? (
          <span className="font-base text-md">
            {user?.firstName} {user?.lastName}
          </span>
        ) : (
          <span className="font-base text-md">
            Please log in to view messages
          </span>
        )}
      </CardHeader>
      <CardContent>
        {user && (
          <>
            <form onSubmit={handleSendMessage}>
              <div className="flex flex-col gap-2">
                <Input
                  value={newMessage}
                  className="w-full sm:w-auto"
                  placeholder="Enter your message"
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <div>
                  <Button
                    className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2"
                    type="submit"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </form>
            <div className="mt-6">
              <ChatView data={data} />
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between"></CardFooter>
    </Card>
  );
}
