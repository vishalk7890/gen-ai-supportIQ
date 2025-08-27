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
import { signIn as amplifySignIn, fetchAuthSession } from "aws-amplify/auth";
import "./Login.css";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await amplifySignIn({ username, password });
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      const accessToken = session.tokens?.accessToken?.toString();
      const refreshToken = session.tokens?.refreshToken?.toString();
      if (idToken) localStorage.setItem("id_token", idToken);
      if (accessToken) localStorage.setItem("access_token", accessToken);
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
      onLogin({ username });
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-box">
        <div className="brand-title" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
          <img alt="SupportIQ" src="/images/pcaui-local.png" width="28" height="28" style={{borderRadius:6}} />
          <span>gen-ai-supportIQ</span>
        </div>
        <p className="subtitle">Sign in to access intelligent call insights</p>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        <button className="login-button" type="submit">Sign In</button>
        <p className="footer-text">© 2025 gen-ai-supportIQ</p>
      </form>
    </div>
  );
}
