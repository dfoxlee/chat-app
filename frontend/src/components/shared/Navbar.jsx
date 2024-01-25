import { UserContext } from "../../context/context";
import { UserDispatchContext } from "../../context/context";
import { useContext, useState } from "react";
import { AuthModal } from "./AuthModal";

import styles from "./Navbar.module.css";

export const Navbar = () => {
   const user = useContext(UserContext);
   const dispatch = useContext(UserDispatchContext);
   const [authType, setAuthType] = useState("");

   const authTypeLogin = (e) => {
      e.preventDefault();

      if (authType === "login") return setAuthType("");

      setAuthType("login");
   };

   const authTypeSignup = (e) => {
      e.preventDefault();

      if (authType === "signup") return setAuthType("");

      setAuthType("signup");
   };

   const closeAuthModal = (e) => {
      e.preventDefault();

      setAuthType("");
   };

   const handleLogout = async (e) => {
      e.preventDefault();

      const body = JSON.stringify({
         screenName: user.screenName,
         token: user.token,
      });

      const res = await fetch("http://localhost:8000/api/v1/users/logout", {
         method: "POST",
         headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
         },
         body: body,
      });
      const payload = await res.json();

      if (payload.error) {
         console.log(payload.error);
      }

      dispatch({ type: "LOGOUT" });
   };

   return (
      <div className={styles.container}>
         <div className={styles.wrapper}>
            <div className={styles.titleWrapper}>
               <h1 className={styles.title}>Chatter</h1>
               {user.screenName ? <h3 className={styles.username}>Hi! {user.screenName}</h3> : null}
            </div>
            {user.userId ? (
               <button className={styles.authBtn} onClick={handleLogout}>
                  Logout
               </button>
            ) : (
               <div className={styles.authBtnWrapper}>
                  <button className={styles.authBtn} onClick={authTypeLogin}>
                     Login
                  </button>
                  <button className={styles.authBtn} onClick={authTypeSignup}>
                     Signup
                  </button>
                  {authType ? (
                     <AuthModal
                        authType={authType}
                        authTypeLogin={authTypeLogin}
                        authTypeSignup={authTypeSignup}
                        closeAuthModal={closeAuthModal}
                     />
                  ) : null}
               </div>
            )}
         </div>
      </div>
   );
};
