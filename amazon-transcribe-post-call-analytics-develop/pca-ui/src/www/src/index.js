// // src/index.js
// import React from "react";
// import ReactDOM from "react-dom";
// import App from "./App";
// import "./index.css";
// import "@cloudscape-design/global-styles/index.css";

// import { Amplify } from "aws-amplify";
// import awsExports from "./aws-exports";

// import { isAuthenticated, redirectToLogin } from "./api/auth";

// Amplify.configure(awsExports);

// const renderApp = () => {
//   ReactDOM.render(
//     <React.StrictMode>
//       <App />
//     </React.StrictMode>,
//     document.getElementById("root")
//   );
// };

// (async () => {
//   const path = window.location.pathname;
//   // Only protect non-login routes
//   if (path !== "/login") {
//     const auth = await isAuthenticated();
//     if (!auth) return redirectToLogin();
//   }
//   renderApp();
// })();



import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Amplify } from "aws-amplify";
import awsConfig from "./aws-exports";
Amplify.configure(awsConfig);


ReactDOM.render(<App />, document.getElementById("root"));
