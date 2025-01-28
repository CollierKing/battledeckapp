"use client";

import NotificationsContext from "./context";

const withNotifications = (Component) => {
  const WithNotifications = (props) => {
    return (
      <NotificationsContext.Consumer>
        {(contexts) => <Component {...props} {...contexts} />}
      </NotificationsContext.Consumer>
    );
  };

  // Set display name for debugging
  WithNotifications.displayName = `withNotifications(${Component.displayName || Component.name || "Component"})`;

  return WithNotifications;
};

export default withNotifications;
