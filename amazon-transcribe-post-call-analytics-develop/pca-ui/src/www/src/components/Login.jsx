// import React, { useState } from "react";
// import { useHistory } from "react-router-dom";
// import { handleCodeRequest } from "../api/auth";
// import './Login.css'; // Ensure this is imported

// export default function Login() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const history = useHistory();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setError("");
//       await handleCodeRequest({ username, password });
//       history.push("/"); // Redirect to home
//     } catch (err) {
//       setError(err.message || "Login failed. Please check your username and password.");
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-box">
//         <h1 className="brand-title">Gen-AI SupportIQ</h1>
//         <p className="subtitle">Sign in to access intelligent call insights</p>

//         {error && <div className="error-message">{error}</div>}

//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Username</label>
//             <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" required />
//           </div>
//           <div className="form-group">
//             <label>Password</label>
//             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
//           </div>
//           <button type="submit" className="login-button">Sign In</button>
//         </form>

//         <p className="footer-text">
//           © 2025 Gen-AI SupportIQ. Need help? <a href="#">Contact Support</a>
//         </p>
//       </div>
//     </div>
//   );
// }



///new one
import React, { useState } from "react";

import { Auth } from "@aws-amplify/auth";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await Auth.signIn(username, password);
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      localStorage.setItem("id_token", idToken);
      onLogin(user); // callback to parent App
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-box">
        <h2>Gen-AI SupportIQ</h2>
        <p className="subtitle">Sign in to access insights</p>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="login-button" type="submit">Sign In</button>
      </form>
    </div>
  );
}
