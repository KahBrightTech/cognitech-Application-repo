import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import {
  signUp,
  confirmSignUp,
  resendConfirmationCode,
  signIn,
  forgotPassword,
  confirmPasswordReset,
} from "../auth/cognito";

// mode: "signin" | "signup" | "confirm" | "forgot" | "reset"
export default function LoginScreen(props) {
  var onLogin = props.onLogin;
  var [mode, setMode] = useState("signin");
  var [name, setName] = useState("");
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [confirmPassword, setConfirmPassword] = useState("");
  var [code, setCode] = useState("");
  var [newPassword, setNewPassword] = useState("");
  var [confirmNewPassword, setConfirmNewPassword] = useState("");
  var [notice, setNotice] = useState("");
  var [busy, setBusy] = useState(false);

  function changeMode(next) {
    setMode(next);
    setNotice("");
    setCode("");
  }

  function submit(event) {
    event.preventDefault();
    if (mode === "signin") return doSignIn();
    if (mode === "signup") return doSignUp();
    if (mode === "confirm") return doConfirm();
    if (mode === "reset") return doReset();
  }

  function doSignIn() {
    if (!email || !password) {
      setNotice("Please complete every field.");
      return;
    }
    setBusy(true);
    signIn({ email, password })
      .then(function (user) {
        setBusy(false);
        onLogin(user);
      })
      .catch(function (err) {
        setBusy(false);
        if (/confirm your email/i.test(err.message)) {
          setMode("confirm");
          setNotice(err.message);
          return;
        }
        setNotice(err.message);
      });
  }

  function doSignUp() {
    if (!email || !password || !name || !confirmPassword) {
      setNotice("Please complete every field.");
      return;
    }
    if (password !== confirmPassword) {
      setNotice("The passwords do not match.");
      return;
    }
    setBusy(true);
    signUp({ email, password, name })
      .then(function () {
        setBusy(false);
        setMode("confirm");
        setNotice("We emailed a verification code to " + email + ". Enter it below to finish creating your account.");
      })
      .catch(function (err) {
        setBusy(false);
        setNotice(err.message);
      });
  }

  function doConfirm() {
    if (!code) {
      setNotice("Please enter the code we emailed you.");
      return;
    }
    setBusy(true);
    confirmSignUp({ email, code })
      .then(function () {
        setBusy(false);
        setMode("signin");
        setPassword("");
        setNotice("Your account is verified. Please sign in.");
      })
      .catch(function (err) {
        setBusy(false);
        setNotice(err.message);
      });
  }

  function doResend() {
    if (!email) {
      setNotice("Enter your email above first.");
      return;
    }
    setBusy(true);
    resendConfirmationCode({ email })
      .then(function () {
        setBusy(false);
        setNotice("We sent a new code to " + email + ".");
      })
      .catch(function (err) {
        setBusy(false);
        setNotice(err.message);
      });
  }

  function doForgot() {
    if (!email) {
      setNotice("Enter your parent email above first.");
      return;
    }
    setBusy(true);
    forgotPassword({ email })
      .then(function () {
        setBusy(false);
        setMode("reset");
        setNotice("Check your email for a reset code.");
      })
      .catch(function (err) {
        setBusy(false);
        setNotice(err.message);
      });
  }

  function doReset() {
    if (!code || !newPassword || !confirmNewPassword) {
      setNotice("Please complete every field.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setNotice("The passwords do not match.");
      return;
    }
    setBusy(true);
    confirmPasswordReset({ email, code, newPassword })
      .then(function () {
        setBusy(false);
        setMode("signin");
        setPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setNotice("Your password has been updated. Please sign in.");
      })
      .catch(function (err) {
        setBusy(false);
        setNotice(err.message);
      });
  }

  return (
    <main className="login-shell">
      <span className="login-blob login-blob-a" aria-hidden="true" />
      <span className="login-blob login-blob-b" aria-hidden="true" />
      <span className="login-blob login-blob-c" aria-hidden="true" />
      <span className="login-sticker login-sticker-a" aria-hidden="true">🩺</span>
      <span className="login-sticker login-sticker-b" aria-hidden="true">💊</span>
      <span className="login-sticker login-sticker-c" aria-hidden="true">⭐</span>
      <span className="login-sticker login-sticker-d" aria-hidden="true">🐾</span>

      <section className="login-card-wrap">
        <div className="login-character">
          <img src="/assets/characters/01-dr-sam.webp" alt="Smiling junior doctor character" />
        </div>

        <form className="login-card" onSubmit={submit}>
          {mode !== "signin" && (
            <button type="button" className="auth-back-button" onClick={function () { changeMode("signin"); }}>
              <ArrowLeft size={18} /> Back
            </button>
          )}

          <div className="login-logo">
            <span>🏥</span>
            <div><strong>Little Doctor</strong><small>ACADEMY</small></div>
          </div>

          {mode === "signin" && <>
            <h1>Welcome Back!</h1>
            <p>Sign in to continue your adventure.</p>
          </>}
          {mode === "signup" && <>
            <h1>Create Your Account</h1>
            <p>Join Little Doctor Academy today!</p>
          </>}
          {mode === "confirm" && <>
            <h1>Check Your Email</h1>
            <p>Enter the verification code we sent you.</p>
          </>}
          {mode === "forgot" && <>
            <h1>Forgot Password?</h1>
            <p>Enter your parent email and we'll email a reset code.</p>
          </>}
          {mode === "reset" && <>
            <h1>Set a New Password</h1>
            <p>Enter the code we emailed you and a new password.</p>
          </>}

          {mode === "signup" && (
            <label>Parent or guardian name
              <div className="input-wrap"><UserRound /><input value={name} onChange={function (e) { setName(e.target.value); }} placeholder="Full name" /></div>
            </label>
          )}

          {mode !== "confirm" && mode !== "reset" && (
            <label>Email
              <div className="input-wrap"><Mail /><input type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} placeholder="parent@example.com" /></div>
            </label>
          )}

          {(mode === "confirm" || mode === "reset") && (
            <label>Verification code
              <div className="input-wrap"><ShieldCheck /><input value={code} onChange={function (e) { setCode(e.target.value); }} placeholder="6-digit code" inputMode="numeric" /></div>
            </label>
          )}

          {(mode === "signin" || mode === "signup") && <>
            <label>Password
              <div className="input-wrap"><LockKeyhole /><input type="password" value={password} onChange={function (e) { setPassword(e.target.value); }} placeholder={mode === "signin" ? "Enter your password" : "Create a password"} /><Eye /></div>
            </label>
            {mode === "signup" && (
              <label>Confirm password
                <div className="input-wrap"><LockKeyhole /><input type="password" value={confirmPassword} onChange={function (e) { setConfirmPassword(e.target.value); }} placeholder="Confirm your password" /></div>
              </label>
            )}
          </>}

          {mode === "reset" && <>
            <label>New password
              <div className="input-wrap"><LockKeyhole /><input type="password" value={newPassword} onChange={function (e) { setNewPassword(e.target.value); }} placeholder="Create a new password" /><Eye /></div>
            </label>
            <label>Confirm new password
              <div className="input-wrap"><LockKeyhole /><input type="password" value={confirmNewPassword} onChange={function (e) { setConfirmNewPassword(e.target.value); }} placeholder="Confirm your new password" /></div>
            </label>
          </>}

          {notice && <div className="form-notice">{notice}</div>}

          {mode === "forgot" && (
            <button className="primary auth-submit" type="button" disabled={busy} onClick={doForgot}>
              {busy ? "Sending…" : "Send Reset Code"} <ArrowRight size={18} />
            </button>
          )}
          {mode !== "forgot" && (
            <button className="primary auth-submit" type="submit" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign In"
                  : mode === "signup"
                    ? "Create Account"
                    : mode === "confirm"
                      ? "Verify Email"
                      : "Update Password"}
              {" "}<ArrowRight size={18} />
            </button>
          )}

          {mode === "confirm" && (
            <button type="button" className="forgot-link" disabled={busy} onClick={doResend}>Resend code</button>
          )}

          {mode === "signin" && <>
            <button type="button" className="forgot-link" onClick={function () { changeMode("forgot"); }}>Forgot Password?</button>
            <div className="social-divider"><span>or sign in with</span></div>
            <div className="social-row">
              <button type="button" aria-label="Google demo">G</button>
              <button type="button" aria-label="Apple demo">●</button>
              <button type="button" aria-label="Child profile demo">🧒</button>
            </div>
            <button type="button" className="create-account-cta" onClick={function () { changeMode("signup"); }}>New here? <strong>Create an Account</strong> <ArrowRight size={17} /></button>
          </>}

          {mode === "signup" && <button type="button" className="text-button auth-switch" onClick={function () { changeMode("signin"); }}>Already have an account? Sign in</button>}
          {mode === "forgot" && <button type="button" className="text-button auth-switch" onClick={function () { changeMode("signin"); }}>Back to Sign In</button>}
          {(mode === "confirm" || mode === "reset") && <button type="button" className="text-button auth-switch" onClick={function () { changeMode("signin"); }}>Back to Sign In</button>}

          <small className="demo-note"><ShieldCheck size={14} /> Secured by Amazon Cognito. Your password is never stored by this app.</small>
        </form>
      </section>

      <section className="login-feature-strip">
        <span>📋 <b>Real Doctor Skills</b></span>
        <span>🦠 <b>Fun &amp; Safe Learning</b></span>
        <span>🧰 <b>Interactive Activities</b></span>
        <span>🏆 <b>Earn Badges &amp; Rewards</b></span>
      </section>
    </main>
  );
}
