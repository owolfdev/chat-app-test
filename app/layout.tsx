"use client";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import UserContext from "@/lib/UserContext";

const inter = Inter({ subsets: ["latin"] });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  info?: string;
  // other properties of user...
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // console.log("check user!");

    if (user) {
      // Get profile for the current user
      // console.log("we have a user", user);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile: ", error);
      } else {
        // Merge user info and profile info
        const fullUserInfo = {
          ...user,
          firstName: profile?.first_name,
          lastName: profile?.last_name,
          avatarUrl: profile?.avatar,
          info: profile?.info,
        };

        setUser(fullUserInfo as User);
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        checkUser();
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, signOut }}>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </UserContext.Provider>
  );
}
