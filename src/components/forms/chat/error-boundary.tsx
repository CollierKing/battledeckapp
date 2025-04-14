"use client";

import React from "react";

/**
 * Custom error boundary component for chat-related errors
 */
export class ChatErrorBoundary extends React.Component<
  { 
    children: React.ReactNode;
    onError: () => void;
    fallback: React.ReactNode;
  },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Chat error:", error);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
} 