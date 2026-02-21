
import { Link } from "react-router-dom"; // Import the Link component
import './styles/Index.css';
import './login.css';




function LogIn() {
  return (
    <>
      <p>Already a user? <Link to="/SignIn">Sign In</Link></p>
      <p>New user? <Link to="/SignUp">Sign Up</Link></p>
    </>
  );
}


export default LogIn;
