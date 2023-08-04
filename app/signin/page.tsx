"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { SignInCard } from "@/components/signin";
import { Divide } from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// const notion = new Client({ auth: process.env.NEXT_PUBLIC_NOTION_API_KEY });

export default function Tmp() {
  const router = useRouter();

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      console.log("User retrieved");
      router.push("/");
    } else {
      console.log("User not retrieved");
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data) {
      }
    };
    checkSession();
  }, []);

  return (
    <section className="container flex flex-col items-center justify-center gap-6 pt-12 pb-8 ">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-center w-full font-extrabold leading-tight tracking-tight text-5xl">
          Sign In
        </h1>
      </div>
      <div className="">
        <SignInCard supabase={supabase} signin={handleSignIn} />
      </div>
    </section>
  );
}
