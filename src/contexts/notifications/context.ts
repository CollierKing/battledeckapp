"use client";

import { Deck } from "@/types/decks";
import * as React from "react";

interface Notifications {
  notifications?: boolean;
  decks: Deck[];
}

interface NotificationsContextType {
  notifications: Notifications | null;
  updateNotifications: (update: Notifications) => void;
}

const defaultContext: NotificationsContextType = {
  notifications: { notifications: false, decks: [] },
  updateNotifications: () => {},
};

const NotificationsContext =
  React.createContext<NotificationsContextType>(defaultContext);

export default NotificationsContext;
