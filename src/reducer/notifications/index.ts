export const notificationsReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_NOTIFICATIONS":
      return {
        ...state,
        ...action.notifications,
      };
    default:
      return state;
  }
};

export const notificationsInitialState = {
  notifications: false,
};
