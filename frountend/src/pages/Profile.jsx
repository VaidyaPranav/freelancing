import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/Profile.css";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">👤</div>
          <h1>{user?.name || "User Profile"}</h1>
        </div>

        <div className="profile-info">
          <div className="info-group">
            <label>Email</label>
            <p>{user?.email || "Not available"}</p>
          </div>

          <div className="info-group">
            <label>Account Status</label>
            <p className="status-active">✅ Active</p>
          </div>

          <div className="info-group">
            <label>Member Since</label>
            <p>January 2024</p>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>

        <div className="profile-tips">
          <h3>💡 Tips to Succeed</h3>
          <ul>
            <li>Create detailed gigs with clear descriptions</li>
            <li>Respond to bids quickly to find the best freelancer</li>
            <li>Communicate clearly with freelancers</li>
            <li>Leave honest feedback after completing projects</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
