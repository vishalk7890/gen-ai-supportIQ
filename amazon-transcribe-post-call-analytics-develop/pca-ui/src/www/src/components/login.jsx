import React, { useState } from 'react';
import { Auth } from '@aws-amplify/auth';
import { useNavigate } from 'react-router-dom'; // if using routing
import './Login.css'; // Optional: custom styles

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const user = await Auth.signIn(username, password);
      console.log('Signed in:', user);
      // Redirect to main app (e.g., /dashboard)
      navigate('/'); // or wherever your app starts
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Post Call Analysis</h2>
        <p className="subtitle">Sign in to access call insights</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        <p className="footer-text">
          Forgot password? <a href="#forgot">Reset it</a>
        </p>
      </div>
    </div>
  );
}

export default Login;