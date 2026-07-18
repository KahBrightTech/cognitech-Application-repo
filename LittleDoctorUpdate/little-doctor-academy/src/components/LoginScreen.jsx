import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";

export default function LoginScreen(props) {
  var onLogin = props.onLogin;
  var [mode, setMode] = useState("signin");
  var [name, setName] = useState("");
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [confirmPassword, setConfirmPassword] = useState("");
  var [notice, setNotice] = useState("");

  function changeMode(next) {
    setMode(next);
    setNotice("");
  }

  function submit(event) {
    event.preventDefault();
    if (!email || !password || (mode === "signup" && (!name || !confirmPassword))) {
      setNotice("Please complete every field.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setNotice("The passwords do not match.");
      return;
    }
    var user = { name: name || email.split("@")[0], email: email };
    localStorage.setItem("lda-demo-user", JSON.stringify(user));
    onLogin(user);
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
          {mode === "forgot" && <>
            <h1>Forgot Password?</h1>
            <p>Enter your parent email and we'll prepare a reset code.</p>
          </>}

          {mode === "signup" && (
            <label>Parent or guardian name
              <div className="input-wrap"><UserRound /><input value={name} onChange={function (e) { setName(e.target.value); }} placeholder="Full name" /></div>
            </label>
          )}

          <label>Email
            <div className="input-wrap"><Mail /><input type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} placeholder="parent@example.com" /></div>
          </label>

          {mode !== "forgot" && <>
            <label>Password
              <div className="input-wrap"><LockKeyhole /><input type="password" value={password} onChange={function (e) { setPassword(e.target.value); }} placeholder={mode === "signin" ? "Enter your password" : "Create a password"} /><Eye /></div>
            </label>
            {mode === "signup" && (
              <label>Confirm password
                <div className="input-wrap"><LockKeyhole /><input type="password" value={confirmPassword} onChange={function (e) { setConfirmPassword(e.target.value); }} placeholder="Confirm your password" /></div>
              </label>
            )}
          </>}

          {notice && <div className="form-notice">{notice}</div>}

          {mode === "forgot" ? (
            <button className="primary auth-submit" type="button" onClick={function () { setNotice("Demo only: Cognito will send the reset code after integration."); }}>Send Reset Code <ArrowRight size={18} /></button>
          ) : (
            <button className="primary auth-submit" type="submit">{mode === "signin" ? "Sign In" : "Create Account"} <ArrowRight size={18} /></button>
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

          <small className="demo-note"><ShieldCheck size={14} /> Demo UI ready for Amazon Cognito. Passwords are not stored.</small>
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
