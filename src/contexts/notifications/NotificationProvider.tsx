"use client";

import * as React from "react";
import { useReducer } from "react";
import NotificationsContext from "./context";
import {
  notificationsReducer,
  notificationsInitialState,
} from "@/reducer/notifications";

const NotificationsProvider = ({ children }) => {
  const [notificationState, dispatch] = useReducer(
    notificationsReducer,
    notificationsInitialState
  );

  const updateNotifications = (notifications) => {
    dispatch({ type: "UPDATE_NOTIFICATIONS", notifications });
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications: notificationState,
        updateNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider;
