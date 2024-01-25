import { IoAddCircle } from "react-icons/io5";
import { useEffect, useState } from "react";

import styles from "./Messages.module.css";

export const Messages = ({
   user,
   activeChat,
   messages,
   setMessages,
   socket,
   friendsOpen,
}) => {
   const [messageInput, setMessageInput] = useState("");
   useEffect(() => {
      const getAllMessages = async () => {
         const body = JSON.stringify({
            roomId: activeChat.roomId,
         });

         const req = await fetch(
            "http://localhost:8000/api/v1/chats/getChatsByRoomId",
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
         setMessages(res);
      };

      if (activeChat.roomId) {
         getAllMessages();

         socket.on(activeChat.roomId, () => getAllMessages());
         
         return () => {
            socket.off(activeChat.roomId, () => console.log("disconnect"));
         };
      }
   }, [activeChat, user]);

   const handleMessageSubmit = async (e) => {
      e.preventDefault();

      const body = JSON.stringify({
         roomId: activeChat.roomId,
         message: messageInput,
         screenName: user.screenName,
      });

      const req = await fetch(
         "http://localhost:8000/api/v1/chats/addChatMessage",
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

      socket.emit("new_message", { roomId: activeChat.roomId });

      setMessageInput("");
   };

   const updateMessageInput = (e) => {
      return setMessageInput(e.target.value);
   };

   return (
      <div
         className={
            friendsOpen
               ? `${styles.container}`
               : `${styles.container} ${styles.containerOpen}`
         }
      >
         <div className={styles.wrapper}>
            <h2 className={styles.title}>
               {activeChat.userId ? `${activeChat.userId}` : "Messages"}
            </h2>
            {activeChat.userId ? (
               <>
                  <div className={styles.messagesContainer}>
                     {messages.length ? (
                        messages.map((m, i) => {
                           return (
                              <div
                                 key={i}
                                 className={
                                    user.screenName === m.screenName
                                       ? `${styles.userMessage}`
                                       : `${styles.friendMessage}`
                                 }
                              >
                                 <div className={styles.messageWrapper}>
                                    <div
                                       className={styles.dateScreenNameWrapper}
                                    >
                                       <h5 className={styles.messageDate}>
                                          {new Date(
                                             m.postDate
                                          ).toLocaleDateString()}
                                       </h5>
                                       <h5 className={styles.messageName}>
                                          {m.screenName}
                                       </h5>
                                    </div>
                                    <h4 className={styles.message}>
                                       {m.message}
                                    </h4>
                                 </div>
                              </div>
                           );
                        }).reverse()
                     ) : (
                        <h4 className={styles.noMessageTitle}>no messages</h4>
                     )}
                  </div>
                  <form
                     className={styles.messageInputWrapper}
                     onSubmit={handleMessageSubmit}
                  >
                     <input
                        className={styles.messageInput}
                        type="text"
                        value={messageInput}
                        onChange={updateMessageInput}
                     />
                     <button
                        className={styles.messageBtn}
                        onClick={handleMessageSubmit}
                     >
                        <IoAddCircle />
                     </button>
                  </form>
               </>
            ) : (
               <h4 className={styles.noChatTitle}>
                  Select a friend to chat with.
               </h4>
            )}
         </div>
      </div>
   );
};
