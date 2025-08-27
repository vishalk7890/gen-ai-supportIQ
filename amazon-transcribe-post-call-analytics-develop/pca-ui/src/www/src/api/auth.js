// const config = window.pcaSettings;
// const webUri = `${window.location.protocol}//${window.location.host}/`;
// const loginUrl = `${config.auth.uri}/login?client_id=${config.auth.clientId}&response_type=code&redirect_uri=${webUri}`;

// export function redirectToLogin(message, err) {
//   console.debug("Redirect to login:", message, err);
//   console.debug("Login URL is:", loginUrl);

//   window.location.href = "/login";
// }

// export function parseAuthQueryString() {
//   const params = new URLSearchParams(window.location.search);
//   const code = params.get("code");
//   const error = params.get("error");
//   if (error) {
//     throw new Error(params.get("error_description") || "Invalid configuration");
//   }
//   return code;
// }

// export async function handleCode(code) {
//   console.debug("Exchanging code for token:", code);

//   let data;
//   try {
//     data = await authRequest("authorization_code", {
//       redirect_uri: webUri,
//       code: code,
//     });
//   } catch (err) {
//     return redirectToLogin("Couldn't validate code", err);
//   }

//   store(data);

//   // Remove code from URL
//   const url = new URL(window.location);
//   url.searchParams.delete("code");
//   window.history.pushState({}, "", url);
// }

// async function authRequest(grant_type, data) {
//   console.debug("Doing", grant_type, " with", data);
//   let body = new URLSearchParams();
//   body.append("grant_type", grant_type);
//   body.append("client_id", config.auth.clientId);
//   Object.keys(data).forEach((key) => {
//     body.append(key, data[key]);
//   });

//   const url = `${config.auth.uri}/oauth2/token`;

//   const response = await fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     body: body,
//   });

//   if (!response.ok) {
//     console.debug(response);
//     throw new Error("Bad response from auth endpoint");
//   }

//   return response.json();
// }

// export async function getToken() {
//   const token = window.localStorage.getItem("access_token");

//   if (token === null) {
//     return;
//   }

//   try {
//     const payload = payloadFromToken(token);
//     if (Math.floor(Date.now() / 1000) < payload.exp) {
//       return token;
//     }
//   } catch (err) {
//     console.debug(err);
//   }

//   // Refresh tokens
//   console.debug("Expired token");

//   try {
//     return refreshToken();
//   } catch (err) {
//     return redirectToLogin("Error refreshing tokens", err);
//   }
// }

// export function payloadFromToken(token) {
//   const parts = token.split(".");

//   if (parts.length !== 3) throw new Error("Invalid token");

//   return JSON.parse(window.atob(parts[1]));
// }

// export async function refreshToken() {
//   // Remove old tokens
//   window.localStorage.removeItem("id_token");
//   window.localStorage.removeItem("access_token");
//   // Get new token
//   let data = await authRequest("refresh_token", {
//     refresh_token: window.localStorage.getItem("refresh_token"),
//   });
//   console.debug("Tokens refreshed");

//   store(data);

//   return data.access_token;
// }

// function store(data) {
//   window.localStorage.setItem("id_token", data.id_token);
//   window.localStorage.setItem("access_token", data.access_token);
//   window.localStorage.setItem("refresh_token", data.refresh_token);
// }

// export function logOut() {
//   console.log("logout clicked");
//   localStorage.removeItem("id_token");
//   localStorage.removeItem("access_token");
//   localStorage.removeItem("refresh_token");
//   redirectToLogin("user logged out");
// }



// export async function handleCodeRequest({ username, password }) {
//   const config = window.pcaSettings;
//   const webUri = `${window.location.protocol}//${window.location.host}/`;

//   const body = new URLSearchParams();
//   body.append("grant_type", "password");       // Password grant
//   body.append("client_id", config.auth.clientId);
//   body.append("username", username);
//   body.append("password", password);

//   const url = `${config.auth.uri}/oauth2/token`;

//   const response = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body,
//   });

//   if (!response.ok) throw new Error("Invalid username or password");

//   const data = await response.json();

//   // Store tokens in localStorage
//   localStorage.setItem("access_token", data.access_token);
//   localStorage.setItem("id_token", data.id_token);
//   localStorage.setItem("refresh_token", data.refresh_token);
// }


// src/api/auth.js
const config = window.pcaSettings;
const webUri = `${window.location.protocol}//${window.location.host}/`;

export function redirectToLogin(message, err) {
  console.debug("Redirect to login:", message, err);
  window.location.href = "/login";
}

export function payloadFromToken(token) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token");
  return JSON.parse(window.atob(parts[1]));
}

export async function refreshToken() {
  const refresh_token = localStorage.getItem("refresh_token");
  if (!refresh_token) return redirectToLogin("No refresh token found");

  const body = new URLSearchParams();
  body.append("grant_type", "refresh_token");
  body.append("client_id", config.auth.clientId);
  body.append("refresh_token", refresh_token);

  const url = `${config.auth.uri}/oauth2/token`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    return redirectToLogin("Failed to refresh token");
  }

  const data = await response.json();
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("id_token", data.id_token);
  localStorage.setItem("refresh_token", data.refresh_token);

  return data.access_token;
}

// ✅ Return valid token
export async function getToken() {
  let token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    const payload = payloadFromToken(token);
    if (Math.floor(Date.now() / 1000) < payload.exp) return token;
  } catch (err) {
    console.debug("Invalid token", err);
  }

  return await refreshToken();
}

export function logOut() {
  localStorage.removeItem("id_token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  redirectToLogin("User logged out");
}

// Password grant login
export async function signIn({ username, password }) {
  const body = new URLSearchParams();
  body.append("grant_type", "password");
  body.append("client_id", config.auth.clientId);
  body.append("username", username);
  body.append("password", password);

  const url = `${config.auth.uri}/oauth2/token`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error("Invalid username or password");
  }

  const data = await response.json();
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("id_token", data.id_token);
  localStorage.setItem("refresh_token", data.refresh_token);

  return data;
}

export function isAuthenticated() {
  return !!localStorage.getItem("access_token");
}
