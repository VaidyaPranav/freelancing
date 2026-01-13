import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/MyGigs.css";

export default function MyGigs() {
  const { user } = useContext(AuthContext);
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchMyGigs();
  }, []);

  const fetchMyGigs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/gigs");
      const myGigs = res.data.filter(gig => gig.ownerId._id === user._id);
      setGigs(myGigs);
    } catch (err) {
      console.error("Failed to fetch my gigs", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredGigs = filter === "all" ? gigs : gigs.filter(g => g.status === filter);

  return (
    <div className="my-gigs-container">
      <div className="my-gigs-header">
        <h1>📝 My Gigs</h1>
        <p>Manage your posted gigs and view bids</p>
      </div>

      <div className="filter-buttons">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All ({gigs.length})
        </button>
        <button
          className={filter === "open" ? "active" : ""}
          onClick={() => setFilter("open")}
        >
          Open ({gigs.filter(g => g.status === "open").length})
        </button>
        <button
          className={filter === "assigned" ? "active" : ""}
          onClick={() => setFilter("assigned")}
        >
          Assigned ({gigs.filter(g => g.status === "assigned").length})
        </button>
      </div>

      {loading && <div className="loading">Loading your gigs...</div>}

      {!loading && filteredGigs.length === 0 && (
        <div className="no-gigs">
          <p>😢 You haven't posted any gigs yet.</p>
          <Link to="/gigs" className="btn-primary">Create a Gig</Link>
        </div>
      )}

      <div className="my-gigs-grid">
        {filteredGigs.map((gig) => (
          <div key={gig._id} className="my-gig-card">
            <div className="gig-status">{gig.status}</div>
            <h3>{gig.title}</h3>
            <p>{gig.description.substring(0, 80)}...</p>
            
            <div className="gig-stats">
              <span>Budget: ${gig.budget}</span>
            </div>

            <Link to={`/gig/${gig._id}`} className="btn-secondary">
              View & Manage
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
