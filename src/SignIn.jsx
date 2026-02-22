import { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import './signin.css';
import { isValidEmail, isValidPassword } from './validation'; // Import the validation functions
import './UserInterface';
import './SignUp';


function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleInput = (event) => {
        const { name, value } = event.target;
        if (name === 'email') {
            setEmail(value);
        } else if (name === 'password') {
            setPassword(value);
        }
    };

    const handleSubmit = async(event) => {
        event.preventDefault();

        if (!isValidEmail(email)) {
            setError('Invalid email format.');
            return;
        }

        if (!isValidPassword(password)) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        try {
            const response = await fetch(`https://eruditely-unpostmarked-shala.ngrok-free.dev/api/user/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log(data);
            localStorage.setItem("token", data.token);
            localStorage.setItem('email', email);
            localStorage.setItem('user_id', data.user.id);
            localStorage.setItem('role', data.user.role); // ✅ store role
            navigate('/userInterface');
            }
            
            else {
                // Authentication failed, display error message
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to sign in. Please try again.');
        }
    };


    return (
        <form onSubmit={handleSubmit}>
            <div className="text-center mb-3">
                <p>Sign in with:</p>
                
            </div>
            {/* <p className="text-center">or:</p> */}
            {error && <p className="text-center text-danger">{error}</p>}

            <label className="form-label" htmlFor="loginName">Email or username</label>
            <div className="form-outline mb-4">
                <input
                    type="email"
                    id="loginName"
                    name="email" // Add name attribute
                    placeholder='Enter your email address'
                    className="form-control"
                    value={email}
                    onChange={handleInput} // Use handleInput function
                    required
                />
                {/* <label className="form-label" htmlFor="loginName">Email or username</label> */}
            </div>

            <label className="form-label" htmlFor="loginPassword">Password</label>
            <div className="form-outline mb-4">
                <input
                    type="password"
                    id="loginPassword"
                    name="password" // Add name attribute
                    placeholder='Enter your password'
                    className="form-control"
                    value={password}
                    onChange={handleInput} // Use handleInput function
                    required
                />
                {/* <label className="form-label" htmlFor="loginPassword">Password</label> */}
            </div>
            <div className="row mb-4">
                
            </div>
            <button type="submit" className="btn btn-primary btn-block mb-4">Sign in</button>
            <div className="text-center">
                <p>Not a member? <Link to="/signup">Register</Link></p>
            </div>
        </form>
    );
}

export default SignIn;
