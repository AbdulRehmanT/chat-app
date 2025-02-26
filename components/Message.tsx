"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageProps {
  text: string;
  userId: string;
  currentUserId: string;
  userImageUrl: string;
  userUsername: string;
  timestamp: string;
}

export const Message = ({
  text,
  userId,
  currentUserId,
  userImageUrl,
  userUsername,
  timestamp,
}: MessageProps) => {
  const isCurrentUser = userId === currentUserId;

  const formattedTimestamp = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} gap-3`}
    >
      {/* Avatar */}
      {!isCurrentUser && (
        <Avatar>
          {userImageUrl ? (
            <AvatarImage src={userImageUrl} alt={userUsername} />
          ) : (
            <AvatarFallback>{userUsername[0]?.toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
      )}
      <div
        className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
      >
        <div className="text-sm text-foreground mb-1">
          <span className="font-semibold">{userUsername}</span> |{" "}
          <span className="text-xs">{formattedTimestamp}</span>
        </div>

        <div
          className={`px-4 py-2 rounded-lg max-w-xs ${
            isCurrentUser ? "bg-primary text-white" : "bg-accent"
          }`}
        >
          {text}
        </div>
      </div>
      {isCurrentUser && (
        <Avatar>
          {userImageUrl ? (
            <AvatarImage src={userImageUrl} alt={userUsername} />
          ) : (
            <AvatarFallback>{userUsername[0]?.toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
      )}
    </div>
  );
};

