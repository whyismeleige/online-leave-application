import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ApplyLeavePage({ user, setUser }) {
  const [leaveType, setLeaveType] = useState("Casual");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leaveType, fromDate, toDate, reason }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Leave application submitted successfully");
        navigate("/my-leaves");
      } else {
        alert(data.error || "Failed to submit leave application");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <nav className="navbar">
        <div className="navContent">
          <Link to="/dashboard" className="logo">OFF_SITE</Link>
          <div className="navLinks">
            <Link to="/dashboard" className="navLink">Dashboard</Link>
            <Link to="/apply-leave" className="navLink">Apply Leave</Link>
            <Link to="/my-leaves" className="navLink">My Leaves</Link>
            {user.role === "admin" && <Link to="/admin" className="navLink">Admin</Link>}
            <button onClick={handleLogout} className="button buttonSmall">Logout</button>
          </div>
        </div>
      </nav>

      <div className="page">
        <div className="container" style={{ maxWidth: "600px" }}>
          <div className="pageHeader">
            <p className="pageSubtitle">/// NEW REQUEST</p>
            <h1 className="pageTitle">Apply for Leave.</h1>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="formGroup">
                <label className="label">Leave Type</label>
                <select
                  className="select"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  required
                >
                  <option value="Casual">Casual</option>
                  <option value="Sick">Sick</option>
                  <option value="Paid">Paid</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="formGroup">
                <label className="label">From Date</label>
                <input
                  type="date"
                  className="input"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                />
              </div>

              <div className="formGroup">
                <label className="label">To Date</label>
                <input
                  type="date"
                  className="input"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                />
              </div>

              <div className="formGroup">
                <label className="label">Reason</label>
                <textarea
                  className="textarea"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="Please provide a reason for your leave..."
                ></textarea>
              </div>

              <div className="flex gap1">
                <button type="submit" className="button" disabled={loading} style={{ flex: 1 }}>
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
                <Link to="/dashboard" className="buttonSecondary" style={{ flex: 1, textAlign: "center" }}>
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplyLeavePage;