import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function DashboardPage({ user, setUser }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaves();
  }, []);

  async function fetchLeaves() {
    try {
      const response = await fetch("http://localhost:8080/api/leaves/my", {
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

  const pendingCount = leaves.filter(l => l.status === "Pending").length;
  const approvedCount = leaves.filter(l => l.status === "Approved").length;
  const totalDays = leaves
    .filter(l => l.status === "Approved")
    .reduce((sum, l) => sum + l.numberOfDays, 0);

  const recentLeaves = leaves.slice(0, 5);

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
        <div className="container">
          <div className="pageHeader">
            <p className="pageSubtitle">/// DASHBOARD</p>
            <h1 className="pageTitle">Welcome, {user.name}.</h1>
          </div>

          <div className="statsGrid">
            <div className="statCard">
              <div className="statValue">{leaves.length}</div>
              <div className="statLabel">Total Applications</div>
            </div>
            <div className="statCard">
              <div className="statValue">{approvedCount}</div>
              <div className="statLabel">Approved</div>
            </div>
            <div className="statCard">
              <div className="statValue" style={{ color: "#ea580c" }}>{pendingCount}</div>
              <div className="statLabel">Pending</div>
            </div>
            <div className="statCard">
              <div className="statValue">{totalDays}</div>
              <div className="statLabel">Days Used</div>
            </div>
          </div>

          <div className="card">
            <div className="flexBetween mb2">
              <h2 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#a8a29e" }}>
                Recent Applications
              </h2>
              <Link to="/apply-leave" className="button buttonSmall">Submit Request</Link>
            </div>

            {loading ? (
              <div className="loading">Loading...</div>
            ) : recentLeaves.length === 0 ? (
              <div className="emptyState">
                <p className="emptyTitle">No leave applications yet.</p>
                <Link to="/apply-leave" className="button">Apply for Leave</Link>
              </div>
            ) : (
              <div>
                {recentLeaves.map(leave => (
                  <div key={leave._id} className="leaveItem">
                    <div className="leaveInfo">
                      <div className="leaveType">{leave.leaveType} Leave</div>
                      <div className="leaveDates">
                        {new Date(leave.fromDate).toLocaleDateString()} — {new Date(leave.toDate).toLocaleDateString()}
                      </div>
                      <div className="leaveDetails">
                        {leave.numberOfDays} day(s) • Applied {new Date(leave.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="leaveActions">
                      <span className={`badge ${
                        leave.status === "Pending" ? "badgePending" :
                        leave.status === "Approved" ? "badgeApproved" :
                        "badgeRejected"
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;