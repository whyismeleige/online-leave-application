import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div>
      <nav className="navbar">
        <div className="navContent">
          <Link to="/" className="logo">OFF_SITE</Link>
          <div className="navLinks">
            <Link to="/login" className="navLink">Login</Link>
            <Link to="/register" className="button buttonSmall">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="hero">
        <h1 className="heroTitle">
          Prioritize your<br />presence.
        </h1>
        <p className="heroSubtitle">
          Time is your most valuable asset. Manage your presence. Request leave, track balances, and prioritize your well-being.
        </p>
        <div className="heroActions">
          <Link to="/register" className="button">Get Started</Link>
          <Link to="/login" className="buttonSecondary">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;