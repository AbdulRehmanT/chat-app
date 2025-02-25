"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatRoom from "@/components/chatroom";
import { useAuthContext } from "@/lib/authContext";

// Define the User type
interface User {
  uid: string;
  imageUrl: string;
  username: string; // Ensure username is always a string
  email: string;
}

export default function Page() {
  const { user } = useAuthContext() || {}; // Get the user from auth context
  const router = useRouter(); // Router for navigation

  
  useEffect(() => {
    if (!user) {
      router.push("/auth/login"); // Redirect to login if no user is found
    }
  }, [user, router]);

  // Ensure username is never 'undefined', set it to empty string if it is
  const userWithDefaultUsername = user
    ? {
        ...user,
        username: user.username ?? "", // Set username to empty string if undefined
      }
    : null;

  // If user is authenticated, render ChatRoom; else, redirect
  return (

      userWithDefaultUsername ? <ChatRoom user={userWithDefaultUsername} /> :
      null
    
  );
}
