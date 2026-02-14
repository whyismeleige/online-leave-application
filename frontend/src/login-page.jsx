import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginPage({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        alert("Logged in successfully");
        navigate("/dashboard");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authContainer">
      <div className="authBox">
        <div className="mb3">
          <p className="authSubtitle">/// ACCESS PORTAL</p>
          <h1 className="authTitle">Sign In.</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="formGroup">
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="button" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="textCenter mt2">
          Don't have an account? <Link to="/register" className="authLink">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;