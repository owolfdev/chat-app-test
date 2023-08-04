"use client";

import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useUser } from "@/lib/UserContext";
import { Divide } from "lucide-react";

type ChatMessage = {
  chat_id: string;
  content: string;
  id: string;
  sender_id: string;
  sent_at: string;
  updated_at: string;
};

export function Chat({ supabase }: { supabase: any }) {
  const [data, setData] = useState<ChatMessage[]>([]);
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  const [newMessage, setNewMessage] = useState<string>("");
  const userContext = useUser();

  const user = userContext ? userContext.user : null;
  const signOut = userContext ? userContext.signOut : null;

  const getData = async () => {
    const { data } = await supabase.from("chat_messages").select();

    if (data) {
      setData(data);
    }

    return data;
  };

  const loadAvatars = async () => {
    const senderIds = Array.from(new Set(data.map((item) => item.sender_id))); // Gets unique sender
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
        sender_id: user?.id, // replace with the actual sender_id
        content: newMessage,
      })
      .single();

    setNewMessage(""); // Clear the input after sending
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
        //(payload: any) => console.log("payload:", payload)
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [data]);

  const ChatView = ({ data }: { data: ChatMessage[] }) => {
    const userContext = useUser();
    const userId = userContext ? userContext.user?.id : null;

    const sortedData = [...data].sort(
      (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
    );

    return (
      <div className="w-full border rounded-lg h-[400px] overflow-y-scroll p-4 flex flex-col">
        {sortedData.map((item, index) => (
          <div
            key={index}
            className={`w-full mb-2 flex items-start ${
              userId === item.sender_id ? "justify-end" : "justify-start"
            }`}
          >
            <div style={{ maxWidth: "75%" }} className="flex gap-1 items-end">
              {userId !== item.sender_id && (
                <div className="w-6 h-6 bg-cover bg-center rounded-full overflow-hidden flex-shrink-0">
                  <img src={avatars[item.sender_id] || ""} />
                </div>
              )}
              <div>
                <div className="text-[11px] text-gray-300 pr-3 pl-3  text-right ">
                  {new Date(item.sent_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    // year: "numeric",
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
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <span className="font-base text-md">
          {user?.firstName} {user?.lastName}
        </span>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendMessage}>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Enter your message"
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <div>
              <Button type="submit">Send</Button>
            </div>
          </div>
        </form>
        <div className="mt-6">
          <ChatView data={data} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between"></CardFooter>
    </Card>
  );
}
