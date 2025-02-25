'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MessageProps {
  text: string;
  userId: string;
  currentUserId: string;
  userImageUrl: string;
  userUsername: string;
  timestamp: string; // Add timestamp field
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

  // Format the timestamp if needed (e.g., display as "hh:mm AM/PM" format)
  const formattedTimestamp = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} gap-3`}>
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

      {/* Message Container */}
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {/* Username & Timestamp */}
        <div className="text-sm text-gray-600 mb-1">
          <span className="font-semibold">{userUsername}</span> |{" "}
          <span className="text-xs">{formattedTimestamp}</span>
        </div>

        {/* Message Bubble */}
        <div
          className={`px-4 py-2 rounded-lg max-w-xs ${
            isCurrentUser ? 'bg-black text-white' : 'bg-gray-200'
          }`}
        >
          {text}
        </div>
      </div>

      {/* Avatar for Current User */}
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
