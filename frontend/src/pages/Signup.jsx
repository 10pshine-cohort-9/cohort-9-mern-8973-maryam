import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page auth-page-signup">
      <section className="auth-showcase" aria-label="NoteNest introduction">
        <div className="brand"><span className="brand-mark">✦</span> NoteNest</div>
        <div className="auth-copy">
          <span className="eyebrow">A home for every idea</span>
          <h1>Make room<br />for what<br /><em>matters.</em></h1>
          <p>Turn loose thoughts into a colourful collection you will actually want to revisit.</p>
        </div>
        <div className="auth-note-preview auth-note-preview-orange">
          <span>Small wins</span>
          <strong>Start with one note. The rest can follow.</strong>
          <div className="preview-dots"><i /><i /><i /></div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="brand brand-mobile"><span className="brand-mark">✦</span> NoteNest</div>
          <span className="eyebrow">Start your collection</span>
          <h2>Create your cosy corner.</h2>
          <p className="auth-subtitle">A few details, then your notes are ready for you.</p>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input"
              placeholder="Your name"
            />
          </div>

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="primary-button auth-submit"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">
            Log in
          </Link>
        </p>
        </div>
      </section>
    </main>
  );
};

export default Signup;
