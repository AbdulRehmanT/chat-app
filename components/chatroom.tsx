"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  db,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "@/lib/firebase"; // Firebase imports
import { Message } from "./Message"; // Importing the Message component
import Logout from "./log-out";

interface User {
  uid: string;
  imageUrl: string;
  username: string;
  email: string;
}

interface ChatRoomProps {
  user: User; // Expecting a user prop with the specified type
}

export default function ChatRoom({ user }: ChatRoomProps) {
  const [messages, setMessages] = useState<any[]>([]); // State to hold messages
  const [input, setInput] = useState(""); // State for input field

  // Fetch messages from Firestore
  useEffect(() => {
    console.log("Setting up Firestore listener");

    const q = query(collection(db, "messages"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("Snapshot received:", snapshot);

        const newMessages = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Message data:", data);
          return {
            ...data,
            timestamp: data.timestamp.toDate().toString(),
            userUsername: data.username,  // Storing the sender's username
          };
        });

        console.log("Fetched messages:", newMessages);
        setMessages(newMessages);
      },
      (error) => {
        console.error("Error fetching messages:", error);
      }
    );

    return () => unsubscribe(); // Clean up listener on component unmount
  }, []);

  // Send message to Firestore
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh on form submit

    if (!input.trim()) return; // Don't send empty messages

    try {
      await addDoc(collection(db, "messages"), {
        userId: user?.uid,
        text: input,
        timestamp: new Date(),
        username: user?.username,  // Storing the sender's username
        imageUrl: user?.imageUrl,  // Storing the sender's image URL (optional)
      });
      setInput(""); // Clear input field after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-4">
        <div className="flex items-center justify-between border-b py-2">
          <h1>Chat app</h1>
          <div>
            <span>{user.username} | </span>
            <span>{user.email}</span>
          </div>
          <Logout />
        </div>
        <CardContent className="h-96 overflow-y-auto p-2 flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500">No messages yet.</div>
          ) : (
            messages.map((msg, index) => (
              <Message
                key={index}
                text={msg.text}
                userId={msg.userId}
                currentUserId={user?.uid}
                userImageUrl={msg.imageUrl}  // Pass the sender's image URL
                userUsername={msg.userUsername}  // Pass the sender's username
                timestamp={msg.timestamp}
              />
            ))
          )}
        </CardContent>

        <form
          onSubmit={sendMessage}
          className="flex items-center gap-2 p-2 border-t"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </form>
      </Card>
    </div>
  );
}
