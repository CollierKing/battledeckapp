"use client";

import Link from "next/link";
import { writeAnalyticsData } from "@/server/actions";

export function TrackableLink({ 
  href, 
  children, 
  className,
  blobs = [],
  doubles = [],
  indexes = []
}: { 
  href: string; 
  children: React.ReactNode;
  className?: string;
  blobs?: string[];
  doubles?: number[];
  indexes?: string[];
}) {
  const handleClick = () => {
    writeAnalyticsData({
      blobs,
      doubles,
      indexes
    });
  };

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
} 