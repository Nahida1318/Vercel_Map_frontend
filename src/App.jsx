import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

import {useEffect, useState } from "react";

import MapBody from "./MapBody.jsx";

import SignIn from "./SignIn.jsx";
import SignUp from "./SignUp.jsx";
import LogIn from "./LogIn.jsx";

import UserInterface from "./UserInterface.jsx";



function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let email = localStorage.getItem("email");

    if (email) {
      setIsAuthenticated(true);
    }
  }, []);
  return (
    <div>
      {!isAuthenticated && <LogIn />}

      <Routes>
        <Route exact path="/" element={<MapBody />} />
        <Route exact path="/" element={<LogIn />} />

        <Route exact path="/signin" element={<SignIn />} />
        <Route exact path="/signup" element={<SignUp />} />
        <Route exact path="/userinterface" element={<UserInterface />} />
      </Routes>
      {/* <Footer /> */}
    </div>
  );
}



export default App;









