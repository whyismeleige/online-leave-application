import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function EditLeavePage({ user, setUser }) {
  const { id } = useParams();
  const [leaveType, setLeaveType] = useState("Casual");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeave();
  }, [id]);

  async function fetchLeave() {
    try {
      const response = await fetch(`http://localhost:8080/api/leaves/${id}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const leave = data.leave;
        setLeaveType(leave.leaveType);
        setFromDate(leave.fromDate.split("T")[0]);
        setToDate(leave.toDate.split("T")[0]);
        setReason(leave.reason);
      } else {
        alert("Leave not found");
        navigate("/my-leaves");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load leave");
      navigate("/my-leaves");
    } finally {
      setLoading(false);
    }
  }

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
    setUpdating(true);

    try {
      const response = await fetch(`http://localhost:8080/api/leaves/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ leaveType, fromDate, toDate, reason }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Leave updated successfully");
        navigate("/my-leaves");
      } else {
        alert(data.error || "Failed to update leave");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div>
        <nav className="navbar">
          <div className="navContent">
            <Link to="/dashboard" className="logo">OFF_SITE</Link>
          </div>
        </nav>
        <div className="loading">Loading...</div>
      </div>
    );
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
            <p className="pageSubtitle">/// EDIT REQUEST</p>
            <h1 className="pageTitle">Update Leave.</h1>
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
                <button type="submit" className="button" disabled={updating} style={{ flex: 1 }}>
                  {updating ? "Updating..." : "Update Leave"}
                </button>
                <Link to="/my-leaves" className="buttonSecondary" style={{ flex: 1, textAlign: "center" }}>
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

export default EditLeavePage;