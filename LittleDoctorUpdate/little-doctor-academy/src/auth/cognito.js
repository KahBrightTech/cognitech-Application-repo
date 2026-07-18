import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";

// Config comes from the Terraform outputs in deploy/terraform/cognito (see
// that folder's README). Two ways it reaches this code:
//  1. Runtime (Docker/Kubernetes): index.html loads /config/env-config.js
//     before this module, which sets window.__ENV__ from container env
//     vars/Helm secrets (see docker/50-generate-env-config.sh). This is
//     the path used in production - the same built image works against
//     any pool without a rebuild.
//  2. Build time (plain `npm run dev` / `npm run build`, no container):
//     falls back to import.meta.env.VITE_*, populated from a local .env
//     file (see .env.example).
function readEnv(key) {
  if (typeof window !== "undefined" && window.__ENV__ && window.__ENV__[key]) {
    return window.__ENV__[key];
  }
  return import.meta.env[key];
}

let pool = null;

function getUserPool() {
  const userPoolId = readEnv("VITE_COGNITO_USER_POOL_ID");
  const clientId = readEnv("VITE_COGNITO_CLIENT_ID");
  if (!userPoolId || !clientId) {
    throw new Error(
      "Cognito is not configured. Set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID (see .env.example, or deploy/terraform/cognito for Docker/Helm)."
    );
  }
  if (!pool) {
    pool = new CognitoUserPool({ UserPoolId: userPoolId, ClientId: clientId });
  }
  return pool;
}

function buildCognitoUser(email) {
  return new CognitoUser({ Username: email, Pool: getUserPool() });
}

// Cognito's exception "code" values, translated into copy that fits the
// app's friendly tone. Falls back to the raw Cognito message if we don't
// have a specific mapping.
function friendlyMessage(error) {
  const code = error && error.code;
  const map = {
    UsernameExistsException: "An account with that email already exists. Try signing in instead.",
    NotAuthorizedException: "That email and password don't match. Please try again.",
    UserNotFoundException: "We couldn't find an account with that email.",
    UserNotConfirmedException: "Please confirm your email before signing in.",
    CodeMismatchException: "That code doesn't look right. Please check and try again.",
    ExpiredCodeException: "That code has expired. Request a new one and try again.",
    InvalidPasswordException: "Please choose a stronger password and try again.",
    InvalidParameterException: "Please double-check the form and try again.",
    LimitExceededException: "Too many attempts. Please wait a bit and try again.",
    TooManyRequestsException: "Too many attempts. Please wait a bit and try again.",
    TooManyFailedAttemptsException: "Too many failed attempts. Please wait a bit and try again.",
  };
  return (code && map[code]) || (error && error.message) || "Something went wrong. Please try again.";
}

/**
 * Registers a new parent/guardian account. Cognito emails a verification
 * code to the address provided; the caller still needs to call
 * confirmSignUp() with that code before the account can sign in.
 */
export function signUp({ email, password, name }) {
  return new Promise((resolve, reject) => {
    const attributes = [new CognitoUserAttribute({ Name: "name", Value: name || email.split("@")[0] })];
    getUserPool().signUp(email, password, attributes, null, (err, result) => {
      if (err) return reject(new Error(friendlyMessage(err)));
      resolve({ userSub: result.userSub, userConfirmed: result.userConfirmed });
    });
  });
}

/** Confirms a new account using the code emailed by Cognito. */
export function confirmSignUp({ email, code }) {
  return new Promise((resolve, reject) => {
    buildCognitoUser(email).confirmRegistration(code, true, (err) => {
      if (err) return reject(new Error(friendlyMessage(err)));
      resolve();
    });
  });
}

/** Re-sends the account verification code. */
export function resendConfirmationCode({ email }) {
  return new Promise((resolve, reject) => {
    buildCognitoUser(email).resendConfirmationCode((err) => {
      if (err) return reject(new Error(friendlyMessage(err)));
      resolve();
    });
  });
}

/**
 * Signs in via SRP (the password itself never goes over the wire).
 * Resolves with the signed-in user's display info; the session/tokens are
 * held internally by amazon-cognito-identity-js in localStorage under its
 * own keys, and can be recovered later with getCurrentSession().
 */
export function signIn({ email, password }) {
  return new Promise((resolve, reject) => {
    const cognitoUser = buildCognitoUser(email);
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: () => {
        cognitoUser.getUserAttributes((err, attrs) => {
          if (err) return reject(new Error(friendlyMessage(err)));
          resolve(attributesToUser(email, attrs));
        });
      },
      onFailure: (err) => reject(new Error(friendlyMessage(err))),
      newPasswordRequired: () => {
        reject(new Error("This account needs a password reset. Please use 'Forgot Password?' to set a new one."));
      },
    });
  });
}

/** Starts the "forgot password" flow; Cognito emails a reset code. */
export function forgotPassword({ email }) {
  return new Promise((resolve, reject) => {
    buildCognitoUser(email).forgotPassword({
      onSuccess: () => resolve(),
      onFailure: (err) => reject(new Error(friendlyMessage(err))),
    });
  });
}

/** Completes the "forgot password" flow with the emailed code + a new password. */
export function confirmPasswordReset({ email, code, newPassword }) {
  return new Promise((resolve, reject) => {
    buildCognitoUser(email).confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(new Error(friendlyMessage(err))),
    });
  });
}

/** Signs the current user out and clears their local Cognito session. */
export function signOut() {
  const user = getUserPool().getCurrentUser();
  if (user) user.signOut();
}

/**
 * Returns the currently signed-in user (refreshing tokens if needed), or
 * null if nobody is signed in / the session can't be refreshed. Meant to
 * be called on app load to restore a session across page reloads.
 */
export function getCurrentSession() {
  return new Promise((resolve) => {
    let cognitoUser;
    try {
      cognitoUser = getUserPool().getCurrentUser();
    } catch {
      resolve(null);
      return;
    }
    if (!cognitoUser) {
      resolve(null);
      return;
    }
    cognitoUser.getSession((err, session) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }
      cognitoUser.getUserAttributes((attrErr, attrs) => {
        if (attrErr) {
          resolve(null);
          return;
        }
        resolve(attributesToUser(cognitoUser.getUsername(), attrs));
      });
    });
  });
}

function attributesToUser(email, attrs) {
  const byName = {};
  (attrs || []).forEach((a) => {
    byName[a.getName()] = a.getValue();
  });
  return { email: byName.email || email, name: byName.name || email.split("@")[0] };
}
