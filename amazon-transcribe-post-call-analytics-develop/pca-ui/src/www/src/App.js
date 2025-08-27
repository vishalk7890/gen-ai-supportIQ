// // src/App.js
// import React, { useState, useEffect } from "react";
// import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
// import { AppLayout, Alert, BreadcrumbGroup, TopNavigation } from "@cloudscape-design/components";
// import Home from "./routes/Home";
// import Search from "./routes/Search";
// import Dashboard from "./routes/Dashboard/index";
// import Login from "./components/Login";
// import { payloadFromToken, logOut } from "./api/auth";

// // Routes configuration
// const routes = [
//   {
//     path: "/search",
//     name: "Search",
//     Component: Search,
//     Breadcrumb: () => (
//       <BreadcrumbGroup
//         items={[
//           { text: "Home", href: "/" },
//           { text: "Search", href: "/search" },
//         ]}
//         ariaLabel="Breadcrumbs"
//       />
//     ),
//   },
//   {
//     path: "/dashboard/parsedFiles/search",
//     name: "Search",
//     Component: Search,
//     Breadcrumb: () => (
//       <BreadcrumbGroup
//         items={[
//           { text: "Home", href: "/" },
//           { text: "Search", href: "/search" },
//         ]}
//         ariaLabel="Breadcrumbs"
//       />
//     ),
//   },
//   {
//     path: "/dashboard/:key*",
//     name: "Call Details",
//     hide: true,
//     Component: Dashboard,
//     Breadcrumb: () => (
//       <BreadcrumbGroup
//         items={[
//           { text: "Home", href: "/" },
//           { text: "Call List", href: "/" },
//           { text: "Call Details", href: "#" },
//         ]}
//         ariaLabel="Breadcrumbs"
//       />
//     ),
//   },
//   {
//     path: "/",
//     name: "Call List",
//     Component: Home,
//     Breadcrumb: () => (
//       <BreadcrumbGroup
//         items={[
//           { text: "Home", href: "#" },
//           { text: "Call List", href: "#" },
//         ]}
//         ariaLabel="Breadcrumbs"
//       />
//     ),
//   },
// ];

// // Top Navigation
// function Navigation({ userName, email }) {
//   return (
//     <TopNavigation
//       identity={{
//         href: "/",
//         title: "Amazon Transcribe Post-Call Analytics",
//         iconName: "settings",
//       }}
//       i18nStrings={{
//         searchIconAriaLabel: "Search",
//         searchDismissIconAriaLabel: "Close search",
//         overflowMenuTriggerText: "More",
//         overflowMenuTitleText: "All",
//         overflowMenuBackIconAriaLabel: "Back",
//         overflowMenuDismissIconAriaLabel: "Close menu",
//       }}
//       utilities={[
//         { type: "button", text: "Search", iconName: "search", href: "/search" },
//         { type: "button", text: "PCA Blog Post", href: "https://amazon.com/post-call-analytics", external: true },
//         {
//           type: "menu-dropdown",
//           text: userName,
//           description: email,
//           iconName: "user-profile",
//           onItemClick: ({ detail }) => {
//             if (detail.id === "signout") logOut();
//           },
//           items: [
//             {
//               id: "support-group",
//               text: "Support",
//               items: [
//                 { id: "documentation", text: "GitHub / Readme", href: "https://github.com/aws-samples/amazon-transcribe-post-call-analytics/", external: true },
//                 { id: "feedback", text: "Blog Post", href: "https://amazon.com/post-call-analytics", external: true },
//               ],
//             },
//             { id: "signout", text: "Sign out" },
//           ],
//         },
//       ]}
//     />
//   );
// }

// // Protected Route wrapper
// function ProtectedRoute({ children }) {
//   const [isAuth, setIsAuth] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem("id_token");
//     if (!token) {
//       setIsAuth(false);
//       return;
//     }
//     try {
//       payloadFromToken(token); // Throws if invalid
//       setIsAuth(true);
//     } catch {
//       setIsAuth(false);
//     }
//   }, []);

//   if (isAuth === null) return null; // Optionally show spinner here
//   if (!isAuth) return <Redirect to="/login" />;
//   return children;
// }

// // Main App
// export default function App() {
//   const [alert, setAlert] = useState();
//   const onDismiss = () => setAlert(null);

//   // Safely parse user token
//   const userToken = localStorage.getItem("id_token");
//   let cognitoUserName = "Unknown";
//   let cognitoEmail = "Unknown";
//   if (userToken) {
//     try {
//       const parsedToken = payloadFromToken(userToken);
//       cognitoUserName = parsedToken["cognito:username"] || "Unknown";
//       cognitoEmail = parsedToken["email"] || "Unknown";
//     } catch (err) {
//       console.error("Invalid token:", err);
//     }
//   }

//   return (
//     <Router>
//       <Switch>
//         {/* Custom Login Page */}
//         <Route path="/login" component={Login} />

//         {/* Protected Routes */}
//         {routes.map(({ path, Component, Breadcrumb }) => (
//           <Route key={path} path={path} exact>
//             <ProtectedRoute>
//               <Navigation userName={cognitoUserName} email={cognitoEmail} />
//               <AppLayout
//                 stickyNotifications
//                 toolsHide
//                 navigationHide
//                 breadcrumbs={<Breadcrumb />}
//                 notifications={alert && (
//                   <Alert variant={alert.variant} dismissible header={alert.heading} onDismiss={onDismiss}>
//                     {alert.text}
//                   </Alert>
//                 )}
//                 content={<Component setAlert={setAlert} />}
//               />
//             </ProtectedRoute>
//           </Route>
//         ))}
//       </Switch>
//     </Router>
//   );
// }





//new

import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Home from "./routes/Home";
import { Auth } from "@aws-amplify/auth";


export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await Auth.currentAuthenticatedUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Login onLogin={(u) => setUser(u)} />;
  }

  return <Home />; // Your main app routes here
}
