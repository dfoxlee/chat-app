import { UserContext } from "../context/context";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { FaUserFriends } from "react-icons/fa";
import socketIO from "socket.io-client";
import { Navbar } from "../components/shared/Navbar";
import { Friends } from "../components/userHome/Friends";
import { Messages } from "../components/userHome/Messages";

import styles from "./UserHome.module.css";

const socket = socketIO.connect("http://localhost:8000");

export const UserHome = () => {
   const [activeChat, setActiveChat] = useState({});
   const [friendsOpen, setFriendsOpen] = useState(false);
   const [messages, setMessages] = useState([]);
   
   const user = useContext(UserContext);
   const navigate = useNavigate();

   if (!user.userId) return navigate("/");

   const toggleFriendsModal = e => {
      e.preventDefault();
      
      setFriendsOpen(prev => !prev)
   }

   return (
      <div className={styles.container}>
         <Navbar />
         <button className={styles.friendsBtn} onClick={toggleFriendsModal}>
            <FaUserFriends />
         </button>
         <main className={styles.mainWrapper}>
            <Friends
               activeChat={activeChat}
               setActiveChat={setActiveChat}
               friendsOpen={friendsOpen}
               toggleFriendsModal={toggleFriendsModal}
               socket={socket}
            />
            <Messages
               socket={socket}
               user={user}
               activeChat={activeChat}
               messages={messages}
               setMessages={setMessages}
               friendsOpen={friendsOpen}
            />
         </main>
      </div>
   );
};
