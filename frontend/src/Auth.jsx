import { useState } from "react";
import { Sparkles, Mail, Lock, UserRound, ArrowRight } from "lucide-react";
import axios from "axios";
import "./Auth.css";


const API_URL = "http://127.0.0.1:8000/api/auth";

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      let response;

      if (mode === "signup") {
        response = await axios.post(`${API_URL}/signup`, {
          name,
          email,
          password,
        });

        // After signup, switch to login so the user can authenticate.
        setMode("login");
        setError("Account created successfully! Please log in.");
      } else {
        response = await axios.post(`${API_URL}/login`, {
          email,
          password,
        });

        onLogin(response.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Sparkles size={23} />
          </div>
          <div>
            <h1>CivicLens</h1>
            <span>Community intelligence</span>
          </div>
        </div>

        <div className="auth-heading">
          <div className="auth-eyebrow">YOUR COMMUNITY, YOUR VOICE</div>
          <h2>
            {mode === "login" ? (
              <>Welcome <span>back.</span></>
            ) : (
              <>Join your <span>community.</span></>
            )}
          </h2>
          <p>
            {mode === "login"
              ? "Sign in to report issues and follow community progress."
              : "Create an account to help make your neighborhood better."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && (
            <label>
              Full name
              <div className="auth-input">
                <UserRound size={17} />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
            </label>
          )}

          <label>
            Email address
            <div className="auth-input">
              <Mail size={17} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </label>

          <label>
            Password
            <div className="auth-input">
              <Lock size={17} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                minLength={6}
                required
              />
            </div>
          </label>

          {error && <div className="auth-message">{error}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign in"
              : "Create account"}
            {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button onClick={() => { setMode("signup"); setError(""); }}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => { setMode("login"); setError(""); }}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>

      <div className="auth-footer">
        Built for better communities <span>✦</span>
      </div>
    </div>
  );
}

export default Auth;