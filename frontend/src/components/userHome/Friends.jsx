import { FaUserFriends, FaUserCheck } from "react-icons/fa";
import { TbUserQuestion } from "react-icons/tb";
import { IoIosSend, IoMdChatboxes } from "react-icons/io";
import { BsMailboxFlag } from "react-icons/bs";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../context/context";
import { UserDispatchContext } from "../../context/context";

import styles from "./Friends.module.css";

export const Friends = ({
   activeChat,
   setActiveChat,
   friendsOpen,
   toggleFriendsModal,
   socket,
}) => {
   const [requestedScreenName, setRequestedScreenName] = useState("");
   const user = useContext(UserContext);
   const dispatch = useContext(UserDispatchContext);

   useEffect(() => {
      const getUserInfo = async () => {
         const body = JSON.stringify({
            userId: user.userId,
            token: user.token,
         });

         const req = await fetch(
            "http://localhost:8000/api/v1/users/updateUser",
            {
               method: "POST",
               headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Content-Type": "application/json",
               },
               body: body,
            }
         );

         const res = await req.json();

         if (res.error) return false;

         return {
            friends: res.user.friends,
            requests: res.user.requests,
            sentRequests: res.user.sentRequests,
         };
      };

      if (user.userId) {
         setInterval(async () => {
            const userInfo = await getUserInfo();

            if (!userInfo) return;

            const currentUserFriends = user.friends.map((u) => u.userId);
            const currentUserRequests = user.requests.map((u) => u.userId);
            const currentUserSentRequests = user.sentRequests.map(
               (u) => u.userId
            );

            const updatedUserFriends = userInfo.friends.map((u) => u.userId);
            const updatedUserRequests = userInfo.requests.map((u) => u.userId);
            const updatedUserSentRequests = userInfo.sentRequests.map(
               (u) => u.userId
            );

            const update =
               currentUserFriends.length === updatedUserFriends.length &&
               currentUserRequests === updatedUserRequests &&
               currentUserSentRequests === updatedUserSentRequests;

            if (update) {
               console.log(update);
               return dispatch({
                  type: "UPDATE_USER",
                  payload: {
                     friends: userInfo.friends,
                     requests: userInfo.requests,
                     sentRequests: userInfo.sentRequests,
                  },
               });
            }
         }, 1000);

         for (let i = 0; i < user.sentRequests.length; i++) {
            socket.on(user.sentRequests[i].roomId, (data) => {
               if (data.type === "UPDATE_USER") {
                  const user = getUserInfo();
               }
            });

            () => socket.off(user.sentRequests[i].roomId);
         }
      }
   }, [user, socket, dispatch]);

   const makeFriendRequest = async (e) => {
      e.preventDefault();

      const body = JSON.stringify({
         requestingScreenName: user.screenName,
         requestedScreenName: requestedScreenName,
      });

      const req = await fetch(
         "http://localhost:8000/api/v1/users/friendRequest",
         {
            method: "POST",
            headers: {
               "Access-Control-Allow-Origin": "*",
               "Content-Type": "application/json",
            },
            body: body,
         }
      );

      const res = await req.json();
      setRequestedScreenName("");
      if (res.error) return console.log(res.msg);

      dispatch({
         type: "UPDATE_REQUESTS",
         payload: {
            requests: res.user.requests,
            sentRequests: res.user.sentRequests,
         },
      });

      socket.emit("FRIEND_REQUEST", { roomId: res.user.roomId });
   };

   const updateRequestedScreenName = (e) => {
      setRequestedScreenName(e.target.value);
   };

   const approveFriendRequest = async (e, friendRequest) => {
      e.preventDefault();

      const body = JSON.stringify({
         approverScreenName: user.screenName,
         requestorScreenName: friendRequest.userId,
      });

      const req = await fetch(
         "http://localhost:8000/api/v1/users/approveFriend",
         {
            method: "POST",
            headers: {
               "Access-Control-Allow-Origin": "*",
               "Content-Type": "application/json",
            },
            body: body,
         }
      );
      const res = await req.json();

      if (res.error) return console.log(res.msg);

      dispatch({
         type: "UPDATE_FRIENDS",
         payload: {
            friends: res.newApproverFriends,
            requests: res.newApproverRequests,
         },
      });

      return socket.emit("APPROVE_FRIENDS", { roomId: friendRequest.roomId });
   };

   const updateActiveChat = (e, f) => {
      toggleFriendsModal(e);

      setActiveChat(f);
   };

   return (
      <div
         className={
            friendsOpen
               ? `${styles.container} ${styles.containerOpen}`
               : `${styles.container}`
         }
      >
         <div className={styles.wrapper}>
            <div className={styles.titleWrapper}>
               <FaUserFriends className={styles.friendsIcon} />
               <h3 className={styles.title}>Friends</h3>
            </div>
            <div className={styles.friendsWrapper}>
               {user.friends.length ? (
                  user.friends.map((f, i) => {
                     return (
                        <div key={i} className={styles.friendUserWrapper}>
                           <h4 className={styles.friendUserId}>{f.userId}</h4>
                           <button
                              className={styles.friendOptionBtn}
                              onClick={(e) => updateActiveChat(e, f)}
                           >
                              <IoMdChatboxes />
                           </button>
                           {/* <button className={styles.friendOptionBtn}>
                              <BsMailboxFlag />
                           </button> */}
                        </div>
                     );
                  })
               ) : (
                  <div>No Friends</div>
               )}
            </div>
            <div className={styles.friendsRequestContainer}>
               <div className={styles.titleWrapper}>
                  <TbUserQuestion className={styles.friendsIcon} />
                  <h5 className={styles.title}>Pending Friend Requests</h5>
               </div>
               <div className={styles.friendsRequestWrapper}>
                  {user.requests.length ? (
                     user.requests.map((r, i) => {
                        return (
                           <div key={i} className={styles.friendUserWrapper}>
                              <h4 className={styles.friendUserId}>
                                 {r.userId}
                              </h4>
                              <button
                                 className={styles.friendOptionBtn}
                                 onClick={(e) => approveFriendRequest(e, r)}
                              >
                                 <FaUserCheck />
                              </button>
                           </div>
                        );
                     })
                  ) : (
                     <div>No open requests</div>
                  )}
               </div>
            </div>
            <form className={styles.formWrapper} onSubmit={makeFriendRequest}>
               <input
                  className={styles.input}
                  type="text"
                  name="friend"
                  placeholder="Send a friend request..."
                  value={requestedScreenName}
                  onChange={updateRequestedScreenName}
               />
               <button className={styles.sendBtn}>
                  <IoIosSend />
               </button>
            </form>
         </div>
      </div>
   );
};
