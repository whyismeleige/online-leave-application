import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function MyLeavesPage({ user, setUser }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
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

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to cancel this leave application?")) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`http://localhost:8080/api/leaves/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        alert("Leave application cancelled");
        setLeaves(leaves.filter(l => l._id !== id));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete leave");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setDeletingId(null);
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
            {user.role === "admin" && <Link to="/admin" className="navLink">Admin</Link>}
            <button onClick={handleLogout} className="button buttonSmall">Logout</button>
          </div>
        </div>
      </nav>

      <div className="page">
        <div className="container">
          <div className="flexBetween mb3" style={{ borderBottom: "1px solid #e7e5e4", paddingBottom: "2rem" }}>
            <div>
              <p className="pageSubtitle">/// HISTORY</p>
              <h1 className="pageTitle">My Applications.</h1>
            </div>
            <Link to="/apply-leave" className="button">New Request</Link>
          </div>

          {!loading && leaves.length > 0 && (
            <div className="statsGrid">
              <div className="statCard">
                <div className="statValue">{leaves.length}</div>
                <div className="statLabel">All</div>
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
            {loading ? (
              <div className="loading">Loading...</div>
            ) : leaves.length === 0 ? (
              <div className="emptyState">
                <p className="emptyTitle">You haven't applied for any leave yet.</p>
                <Link to="/apply-leave" className="button">Apply Now</Link>
              </div>
            ) : (
              <div>
                {leaves.map(leave => (
                  <div key={leave._id} className="leaveItem">
                    <div className="leaveInfo">
                      <div className="leaveType">{leave.leaveType} Leave</div>
                      <div className="leaveDates">
                        {new Date(leave.fromDate).toLocaleDateString()} — {new Date(leave.toDate).toLocaleDateString()}
                      </div>
                      <div className="leaveDetails">
                        {leave.numberOfDays} day(s) • Applied {new Date(leave.createdAt).toLocaleDateString()}
                      </div>
                      {leave.adminNote && (
                        <div style={{ fontSize: "0.75rem", color: "#a8a29e", fontStyle: "italic", marginTop: "0.5rem" }}>
                          "{leave.adminNote}"
                        </div>
                      )}
                    </div>
                    <div className="leaveActions">
                      <span className={`badge ${
                        leave.status === "Pending" ? "badgePending" :
                        leave.status === "Approved" ? "badgeApproved" :
                        "badgeRejected"
                      }`}>
                        {leave.status}
                      </span>
                      {leave.status === "Pending" && (
                        <>
                          <Link to={`/edit-leave/${leave._id}`} className="buttonSecondary buttonSmall">
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(leave._id)}
                            className="buttonDanger buttonSmall"
                            disabled={deletingId === leave._id}
                          >
                            {deletingId === leave._id ? "Deleting..." : "Cancel"}
                          </button>
                        </>
                      )}
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

export default MyLeavesPage;