// src/index.js

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "@cloudscape-design/global-styles/index.css";

// ✅ Move ALL imports to the top
import { Amplify } from '@aws-amplify/core';
import awsExports from './aws-exports';

// 🔽 Now it's safe to run configuration
Amplify.configure(awsExports);

// 🔽 Your existing auth logic
import {
  parseAuthQueryString,
  getToken,
  redirectToLogin,
  handleCode,
} from "./api/auth";

const renderApp = () => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
};

(async () => {
  try {
    const tokenData = parseAuthQueryString();
    if (tokenData) await handleCode(tokenData);
    const token = await getToken();
    if (!token) throw new Error("No token, auth required");
    renderApp();
  } catch (e) {
    console.error(e);
    redirectToLogin();
  }
})();

// Optional: Enable performance tracking
// reportWebVitals(console.log); // Log to console
// OR send to analytics:
// reportWebVitals(sendToAnalytics);