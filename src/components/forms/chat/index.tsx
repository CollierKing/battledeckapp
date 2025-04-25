"use client";

import { Session } from "next-auth";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatErrorBoundary } from "./error-boundary";
import { useToast } from "@/hooks/use-toast";

// Dynamically import the chat interface with error handling
const ChatComponent = dynamic(() => import('./chat-interface').catch(error => {
  console.error('Failed to load chat component:', error);
  return () => null; // Return empty component on error
}), {
  ssr: false, // This ensures the component only loads on client side
  loading: () => <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>
});

// Constants
export const APPROVAL = {
  YES: "Yes, confirmed.",
  NO: "No, denied.",
} as const;

/**
 * SafeChat component that includes error handling
 */
export const SafeChat = ({ 
  session, 
  onClose 
}: { 
  session: Session | null;
  onClose?: () => void;
}) => {
  const [internalError, setInternalError] = useState(false);
  const { toast } = useToast();

  const handleChatError = () => {
    setInternalError(true);
    toast({
      title: "Connection Error",
      description: "Chat service is currently unavailable. Please try again later.",
      variant: "destructive",
    });
  };

  // useEffect(() => {
  //   // Check if the chat service is available
  //   fetch('http://localhost:5173/api/health', { 
  //     method: 'HEAD',
  //     signal: AbortSignal.timeout(2000) // Timeout after 2 seconds
  //   })
  //   .catch(err => {
  //     console.warn('Chat service health check failed:', err);
  //     setInternalError(true);
  //   });
  // }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (internalError) {
    return (
      <div className="flex h-full items-center justify-center flex-col gap-4 p-6">
        <p className="text-destructive">Chat service is unavailable.</p>
        <Button 
          variant="outline" 
          onClick={handleClose}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <ChatErrorBoundary 
      fallback={
        <div className="flex h-full items-center justify-center flex-col gap-4 p-6">
          <p className="text-destructive">Chat service encountered an error.</p>
          <Button 
            variant="outline" 
            onClick={handleClose}>
            Close
          </Button>
        </div>
      }
      onError={handleChatError}
    >
      <ChatComponent session={session} onClose={onClose}/>
    </ChatErrorBoundary>
  );
};

export { ChatComponent };
export default SafeChat; 