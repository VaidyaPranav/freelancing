import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Navbar.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          💼 FreelanceHub
        </Link>
        <div className="nav-menu">
          {user ? (
            <>
              <Link to="/gigs" className="nav-link">Browse Gigs</Link>
              <Link to="/my-gigs" className="nav-link">My Gigs</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <span className="nav-user">👤 {user.name || user}</span>
              <button onClick={handleLogout} className="nav-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link nav-register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
