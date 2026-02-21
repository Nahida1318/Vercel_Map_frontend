import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

import {useEffect, useState } from "react";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import MapBody from "./MapBody.jsx";
//import LogIn from './LogIn.jsx';
import SignIn from "./SignIn.jsx";
import SignUp from "./SignUp.jsx";
import LogIn from "./LogIn.jsx";
//import SignUp from './Signup.jsx';
// import SignIn from './Signin.jsx';
import UserInterface from "./UserInterface.jsx";
// import './styles/Index.css';
// import './login.css';
// import './signin.css';
// import './signup.css';



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
      <Header />
      {/* <MapBody/> */}

      {!isAuthenticated ? <LogIn /> : <div></div>}

      <Routes>
        <Route exact path="/" element={<MapBody />} />
        <Route exact path="/" element={<LogIn />} />
        <Route exact path="/signin" element={<SignIn />} />
        <Route exact path="/signup" element={<SignUp />} />
        <Route exact path="/userinterface" element={<UserInterface />} />
      </Routes>
      <Footer />
    </div>
  );
}






// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     let email = localStorage.getItem("email");
//     if (email) {
//       setIsAuthenticated(true);
//     }
//   }, []);

//   return (
//     <div>
//       <Header />

//       <Routes>
//         {/* Public routes */}
//         <Route path="/signin" element={<SignIn />} />
//         <Route path="/signup" element={<SignUp />} />

//         {/* Protected routes */}
//         <Route
//           path="/"
//           element={isAuthenticated ? <MapBody /> : <LogIn />}
//         />


//         <Route
//   path="/userinterface"
//   element={<UserInterface isAuthenticated={isAuthenticated} />}
// />


// {/* 

//         <Route
//           path="/userinterface"
//           element={isAuthenticated ? <UserInterface /> : <LogIn />}
//         /> */}

//       </Routes>

//       <Footer />
//     </div>
//   );
// }

export default App;









