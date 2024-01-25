import { createContext, useContext, useReducer } from "react";

export const UserContext = createContext();
export const UserDispatchContext = createContext();

const initialUser = {
   userId: localStorage.getItem("chatter-user-userId") || "",
   screenName: localStorage.getItem("chatter-user-screenName") || "",
   token: localStorage.getItem("chatter-user-token") || "",
   friends: localStorage.getItem("chatter-user-friends")
      ? JSON.parse(localStorage.getItem("chatter-user-friends"))
      : "",
   requests: localStorage.getItem("chatter-user-requests")
      ? JSON.parse(localStorage.getItem("chatter-user-requests"))
      : "",
   sentRequests: localStorage.getItem("chatter-user-sentRequests")
      ? JSON.parse(localStorage.getItem("chatter-user-sentRequests"))
      : "",
};

const userReducer = (state, action) => {
   switch (action.type) {
      case "LOGIN":
         localStorage.setItem("chatter-user-userId", action.payload.userId);
         localStorage.setItem(
            "chatter-user-screenName",
            action.payload.screenName
         );
         localStorage.setItem("chatter-user-token", action.payload.token);
         localStorage.setItem(
            "chatter-user-friends",
            JSON.stringify(action.payload.friends)
         );
         localStorage.setItem(
            "chatter-user-requests",
            JSON.stringify(action.payload.requests)
         );
         localStorage.setItem(
            "chatter-user-sentRequests",
            JSON.stringify(action.payload.sentRequests)
         );

         return {
            userId: action.payload.userId,
            screenName: action.payload.screenName,
            token: action.payload.token,
            friends: action.payload.friends,
            requests: action.payload.requests,
            sentRequests: action.payload.sentRequests,
         };

      case "LOGOUT":
         localStorage.setItem("chatter-user-userId", "");
         localStorage.setItem("chatter-user-screenName", "");
         localStorage.setItem("chatter-user-token", "");
         localStorage.setItem("chatter-user-friends", "");
         localStorage.setItem("chatter-user-requests", "");
         localStorage.setItem("chatter-user-sentRequests", "");

         return {
            userId: "",
            screenName: "",
            token: "",
            friends: [],
            requests: [],
            sentRequests: [],
         };

      case "UPDATE_REQUESTS":
         localStorage.setItem(
            "chatter-user-sentRequests",
            JSON.stringify(action.payload.sentRequests)
         );
         localStorage.setItem(
            "chatter-user-requests",
            JSON.stringify(action.payload.requests)
         );

         return {
            ...state,
            requests: action.payload.requests,
            sentRequests: action.payload.sentRequests,
         };
      case "UPDATE_FRIENDS":
         localStorage.setItem(
            "chatter-user-friends",
            JSON.stringify(action.payload.friends)
         );
         localStorage.setItem(
            "chatter-user-requests",
            JSON.stringify(action.payload.requests)
         );

         return {
            ...state,
            friends: action.payload.friends,
            requests: action.payload.requests,
         };
      case 'UPDATE_USER':
         // localStorage.setItem("chatter-user-token", action.payload.token);
         localStorage.setItem(
            "chatter-user-friends",
            JSON.stringify(action.payload.friends)
         );
         localStorage.setItem(
            "chatter-user-requests",
            JSON.stringify(action.payload.requests)
         );
         localStorage.setItem(
            "chatter-user-sentRequests",
            JSON.stringify(action.payload.sentRequests)
         );

         return {
            ...state,
            // token: action.payload.token,
            friends: action.payload.friends,
            requests: action.payload.requests,
            sentRequests: action.payload.sentRequests,
         };
      default:
         return { ...state };
   }
};

export const ContextProvider = ({ children }) => {
   const [user, dispatch] = useReducer(userReducer, initialUser);

   return (
      <UserContext.Provider value={user}>
         <UserDispatchContext.Provider value={dispatch}>
            {children}
         </UserDispatchContext.Provider>
      </UserContext.Provider>
   );
};
