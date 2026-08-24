import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-showcase" aria-label="NoteNest introduction">
        <div className="brand"><span className="brand-mark">✦</span> NoteNest</div>
        <div className="auth-copy">
          <span className="eyebrow">Your thoughts, beautifully kept</span>
          <h1>Think it.<br />Note it.<br /><em>Keep it.</em></h1>
          <p>A calm, colourful space for every plan, spark, and small reminder.</p>
        </div>
        <div className="auth-note-preview">
          <span>Today’s thought</span>
          <strong>Little steps still move you forward.</strong>
          <div className="preview-dots"><i /><i /><i /></div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="brand brand-mobile"><span className="brand-mark">✦</span> NoteNest</div>
          <span className="eyebrow">Welcome back</span>
          <h2>Ready to pick up where you left off?</h2>
          <p className="auth-subtitle">Log in to see your personal collection of notes.</p>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="you@example.com"
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="primary-button auth-submit"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/signup">
            Sign up
          </Link>
        </p>
        </div>
      </section>
    </main>
  );
};

export default Login;
