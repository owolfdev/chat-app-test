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

const ChatView = ({ data }: { data: ChatMessage[] }) => {
  const userContext = useUser();
  const userId = userContext ? userContext.user?.id : null;

  return (
    <div className="w-full border rounded-lg h-[400px] overflow-y-scroll p-4 flex flex-col">
      {data.map((item, index) => (
        <div
          key={index}
          className={`w-full mb-2 flex items-start ${
            userId === item.sender_id ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`${
              userId === item.sender_id
                ? "bg-blue-500 text-white"
                : "bg-gray-300 text-black"
            } rounded-2xl p-2 break-words inline-flex text-sm`}
            style={{ maxWidth: "75%" }}
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
};

export function Chat({ supabase }: { supabase: any }) {
  const [data, setData] = useState<ChatMessage[]>([]);
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

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    console.log("data", data);
  }, [data]);

  const handleSendMessage = (e: any) => {
    e.preventDefault();
    console.log("send message");
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
        <form>
          <div className="flex flex-col gap-2">
            <Input placeholder="Enter your message" />
            <div>
              <Button onClick={handleSendMessage}>Send</Button>
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
