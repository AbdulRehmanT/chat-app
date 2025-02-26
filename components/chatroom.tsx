import { useState, useEffect, useRef } from "react";
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
} from "@/lib/firebase"; 
import { Message } from "./Message"; 
import Logout from "./log-out";

interface User {
  uid: string;
  imageUrl: string;
  username: string;
  email: string;
}

interface ChatRoomProps {
  user: User; 
}

export default function ChatRoom({ user }: ChatRoomProps) {
  const [messages, setMessages] = useState<any[]>([]); 
  const [input, setInput] = useState(""); 

  // Reference to the message container
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the bottom when a new message is added or when the component mounts
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
            userUsername: data.username,  
          };
        });

        console.log("Fetched messages:", newMessages);
        setMessages(newMessages);
      },
      (error) => {
        console.error("Error fetching messages:", error);
      }
    );

    return () => unsubscribe(); 
  }, []);

  // Send message to Firestore
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!input.trim()) return; 

    try {
      await addDoc(collection(db, "messages"), {
        userId: user?.uid,
        text: input,
        timestamp: new Date(),
        username: user?.username,  
        imageUrl: user?.imageUrl,  // Pass the user avatar imageUrl here
      });
      setInput(""); 
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Scroll to the bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Effect to auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
                userImageUrl={msg.imageUrl} // This is where you use the avatar URL
                userUsername={msg.userUsername} 
                timestamp={msg.timestamp}
              />
            ))
          )}
          {/* Add an empty div that will be scrolled into view */}
          <div ref={messagesEndRef} />
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
