import { Navbar } from '../components/shared/Navbar';
import {UserContext} from '../context/context';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './Home.module.css';
import { Hero } from '../components/home/Hero';

export const Home = () => {
   const user = useContext(UserContext);
   const navigate = useNavigate();

   useEffect(() => {
      const verifyToken = async () => {
         const body = JSON.stringify({
            screenName: user.screenName,
            token: user.token,
         })

         const req = await fetch('http://localhost:8000/api/v1/users/verifyToken', {
            method: "POST",
            headers: {
               'Access-Control-Allow-Origin': '*',
               'Content-Type': 'application/json',
            },
            body: body
         })
         const res = await req.json();

         if (res.error) return console.log(res.msg)
         navigate('/userhome')
      }

      if (user.screenName) verifyToken();
   })
   return <div className={styles.container}>
      <Navbar />
      <Hero />
   </div>
}