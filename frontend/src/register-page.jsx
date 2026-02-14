import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function RegisterPage({ setUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, department }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        alert("Account created successfully");
        navigate("/dashboard");
      } else {
        alert(data.error || "Registration failed");
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
          <p className="authSubtitle">/// CREATE ACCOUNT</p>
          <h1 className="authTitle">Register.</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label className="label">Name</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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

          <div className="formGroup">
            <label className="label">Department</label>
            <input
              type="text"
              className="input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <button type="submit" className="button" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="textCenter mt2">
          Already have an account? <Link to="/login" className="authLink">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;