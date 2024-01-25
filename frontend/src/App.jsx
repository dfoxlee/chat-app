import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { ContextProvider } from "./context/context";
import {UserHome} from "./pages/UserHome";

function App() {
   return (
      <ContextProvider>
         <BrowserRouter>
            <Routes>
               <Route path="/" element={<Home />} />
               <Route path="/userhome" element={<UserHome />} />
            </Routes>
         </BrowserRouter>
      </ContextProvider>
   );
}

export default App;
