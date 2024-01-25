import styles from "./Hero.module.css";

import peopleTalking from "../../assets/people-talking.png";

export const Hero = () => {
   return (
      <div className={styles.container}>
         <div className={styles.wrapper}>
            <div className={styles.textWrapper}>
               <h2 className={styles.title}>Stay Up To Date With Everyone</h2>
               <h5 className={styles.titleSubText}>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim
                  maxime assumenda rerum quasi est natus.
               </h5>
            </div>
            <div className={styles.imgWrapper}>
               <img
                  className={styles.peopleTalkingImg}
                  src={peopleTalking}
                  alt="people talking graphic"
               />
            </div>
         </div>
      </div>
   );
};
