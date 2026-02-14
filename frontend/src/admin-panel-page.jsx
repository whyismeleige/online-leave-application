import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function AdminPanelPage({ user, setUser }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllLeaves();
  }, []);

  async function fetchAllLeaves() {
    try {
      const response = await fetch("http://localhost:8080/api/leaves", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setLeaves(data.leaves || []);
      }
    } catch (error) {
      console.error(error);
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

  async function handleStatusUpdate(id, status) {
    const note = prompt(`Enter a note for this ${status.toLowerCase()} decision (optional):`);
    
    setProcessingId(id);

    try {
      const response = await fetch(`http://localhost:8080/api/leaves/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, adminNote: note || "" }),
      });

      if (response.ok) {
        alert(`Leave ${status.toLowerCase()} successfully`);
        fetchAllLeaves();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setProcessingId(null);
    }
  }

  const pendingLeaves = leaves.filter(l => l.status === "Pending");
  const approvedLeaves = leaves.filter(l => l.status === "Approved");
  const rejectedLeaves = leaves.filter(l => l.status === "Rejected");

  return (
    <div>
      <nav className="navbar">
        <div className="navContent">
          <Link to="/dashboard" className="logo">OFF_SITE</Link>
          <div className="navLinks">
            <Link to="/dashboard" className="navLink">Dashboard</Link>
            <Link to="/apply-leave" className="navLink">Apply Leave</Link>
            <Link to="/my-leaves" className="navLink">My Leaves</Link>
            <Link to="/admin" className="navLink">Admin</Link>
            <button onClick={handleLogout} className="button buttonSmall">Logout</button>
          </div>
        </div>
      </nav>

      <div className="page">
        <div className="container">
          <div className="pageHeader" style={{ borderBottom: "1px solid #e7e5e4", paddingBottom: "2rem", marginBottom: "3rem" }}>
            <p className="pageSubtitle">/// ADMIN PANEL</p>
            <h1 className="pageTitle">Manage Leaves.</h1>
          </div>

          {!loading && leaves.length > 0 && (
            <div className="statsGrid">
              <div className="statCard">
                <div className="statValue">{leaves.length}</div>
                <div className="statLabel">Total Applications</div>
              </div>
              <div className="statCard">
                <div className="statValue" style={{ color: "#ea580c" }}>{pendingLeaves.length}</div>
                <div className="statLabel">Pending</div>
              </div>
              <div className="statCard">
                <div className="statValue">{approvedLeaves.length}</div>
                <div className="statLabel">Approved</div>
              </div>
              <div className="statCard">
                <div className="statValue">{rejectedLeaves.length}</div>
                <div className="statLabel">Rejected</div>
              </div>
            </div>
          )}

          <div className="card">
            <h2 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#a8a29e", marginBottom: "1.5rem" }}>
              All Leave Applications
            </h2>

            {loading ? (
              <div className="loading">Loading...</div>
            ) : leaves.length === 0 ? (
              <div className="emptyState">
                <p className="emptyTitle">No leave applications yet.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Duration</th>
                    <th>Days</th>
                    <th>Applied</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(leave => (
                    <tr key={leave._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{leave.userName}</div>
                        <div style={{ fontSize: "0.75rem", color: "#a8a29e" }}>{leave.userDepartment}</div>
                      </td>
                      <td>{leave.leaveType}</td>
                      <td style={{ fontSize: "0.875rem" }}>
                        {new Date(leave.fromDate).toLocaleDateString()} — {new Date(leave.toDate).toLocaleDateString()}
                      </td>
                      <td>{leave.numberOfDays}</td>
                      <td style={{ fontSize: "0.875rem" }}>{new Date(leave.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${
                          leave.status === "Pending" ? "badgePending" :
                          leave.status === "Approved" ? "badgeApproved" :
                          "badgeRejected"
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      <td>
                        {leave.status === "Pending" && (
                          <div className="flex gap1">
                            <button
                              onClick={() => handleStatusUpdate(leave._id, "Approved")}
                              className="button buttonSmall"
                              disabled={processingId === leave._id}
                              style={{ background: "#166534" }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(leave._id, "Rejected")}
                              className="buttonDanger buttonSmall"
                              disabled={processingId === leave._id}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanelPage;