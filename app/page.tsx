"use client";

import Image from "next/image";
import { Chat } from "@/components/chat";
import ChatReverseScroll from "@/components/chat-reverse-scroll";

import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import { useUser } from "@/lib/UserContext";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function Home() {
  const router = useRouter();

  const userContext = useUser();

  const handleSupabaseAuth = async () => {
    if (userContext?.user) {
      await userContext.signOut();
      router.push("/signin");
    } else {
      router.push("/signin");
    }
  };

  return (
    <section className="container flex flex-col items-center justify-center gap-6 pt-12 pb-8 px-5 sm:px-8 md:px-12 ">
      <div className="flex flex-col items-start gap-2 ">
        <div className="flex gap-2">
          <h1 className="text-center w-full font-extrabold leading-tight tracking-tight text-5xl sm:text-4xl md:text-5xl">
            Chat App
          </h1>
          <div className="w-[150px] items-center flex">
            <button
              className="rounded bg-gray-200 px-2 mt-2 hover:bg-gray-100 cursor-pointer border "
              onClick={handleSupabaseAuth}
            >
              {userContext?.user ? "Sign Out" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
      <div className="sm:w-[500px]">
        <Chat supabase={supabase} />
      </div>
      <div className="sm:w-[500px]">
        <ChatReverseScroll supabase={supabase} />
      </div>
    </section>
  );
}
