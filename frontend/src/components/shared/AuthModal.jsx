import { RxAvatar } from "react-icons/rx";
import { useState } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/context";
import { UserDispatchContext } from "../../context/context";
import { IoIosCloseCircleOutline } from "react-icons/io";

import styles from "./AuthModal.module.css";

export const AuthModal = ({
   authType,
   authTypeLogin,
   authTypeSignup,
   closeAuthModal,
}) => {
   const [authValues, setAuthValues] = useState({
      screenName: "",
      password: "",
      passwordConfirm: "",
   });
   const user = useContext(UserContext);
   const dispatch = useContext(UserDispatchContext);
   const navigate = useNavigate();

   const toggleAuthType = (e) => {
      authType === "login" ? authTypeSignup(e) : authTypeLogin(e);
   };

   const handleAuthSubmit = async (e) => {
      e.preventDefault();

      const body = JSON.stringify({
         screenName: authValues.screenName,
         password: authValues.password,
      });
      if (authType === "signup") {
         const res = await fetch("http://localhost:8000/api/v1/users/signup", {
            method: "POST",
            headers: {
               "Access-Control-Allow-Origin": "*",
               "Content-Type": "application/json",
            },
            body: body,
         });
         const payload = await res.json();

         if (payload.error) {
            console.log(payload.msg);
            return closeAuthModal(e);
         }

         dispatch({
            type: "LOGIN",
            payload: {
               userId: payload.user.userId,
               screenName: payload.user.screenName,
               token: payload.user.token,
               friends: payload.user.friends,
               requests: payload.user.requests,
               sentRequests: payload.user.sentRequests,
            },
         });

         navigate("/userhome");

         return closeAuthModal(e);
      }

      const res = await fetch("http://localhost:8000/api/v1/users/login", {
         method: "POST",
         headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
         },
         body: body,
      });
      const payload = await res.json();

      if (payload.error) {
         console.log(payload.msg);
         return closeAuthModal(e);
      }

      dispatch({
         type: "LOGIN",
         payload: {
            userId: payload.user.userId,
            screenName: payload.user.screenName,
            token: payload.user.token,
            friends: payload.user.friends,
            requests: payload.user.requests,
            sentRequests: payload.user.sentRequests,
         },
      });

      navigate("/userhome");

      return closeAuthModal(e);
   };

   const updateScreenName = (e) => {
      setAuthValues((prev) => {
         return { ...prev, screenName: e.target.value };
      });
   };

   const updatePassword = (e) => {
      setAuthValues((prev) => {
         return { ...prev, password: e.target.value };
      });
   };

   const updatePasswordConfirm = (e) => {
      setAuthValues((prev) => {
         return { ...prev, passwordConfirm: e.target.value };
      });
   };

   return (
      <form className={styles.wrapper} onSubmit={handleAuthSubmit}>
         <button
            className={styles.closeModalBtn}
            type="button"
            onClick={closeAuthModal}
         >
            <IoIosCloseCircleOutline />
         </button>
         <RxAvatar className={styles.avatarImg} />
         <div className={styles.inputWrapper}>
            <label className={styles.label} htmlFor="screen-name">
               Screen Name:
            </label>
            <input
               className={styles.input}
               type="text"
               name="screen-name"
               required
               value={authValues.screenName}
               onChange={updateScreenName}
            />
         </div>
         <div className={styles.inputWrapper}>
            <label className={styles.label} htmlFor="password">
               Password:
            </label>
            <input
               className={styles.input}
               type="password"
               name="password"
               required
               value={authValues.password}
               onChange={updatePassword}
            />
         </div>
         {authType === "signup" ? (
            <div className={styles.inputWrapper}>
               <label className={styles.label} htmlFor="password-confirmed">
                  Confirm Password:
               </label>
               <input
                  className={styles.input}
                  type="password"
                  name="password-confirmed"
                  required
                  value={authValues.passwordConfirm}
                  onChange={updatePasswordConfirm}
               />
            </div>
         ) : null}
         <div className={styles.changeAuthTypeWrapper}>
            <h4 className={styles.changeAuthQuestion}>
               {authType === "login"
                  ? "Not a member, yet?"
                  : "Already a member?"}
            </h4>
            <button
               className={styles.changeAuthBtn}
               type="button"
               onClick={toggleAuthType}
            >
               {authType === "login" ? "Sign Up" : "Login"}
            </button>
         </div>
         <button className={styles.authSubmitBtn} onClick={handleAuthSubmit}>
            {authType === "signup" ? "Sign Up" : "Login"}
         </button>
      </form>
   );
};
