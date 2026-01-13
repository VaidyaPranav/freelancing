import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Gigs.css";

export default function Gigs() {
  const { user } = useContext(AuthContext);
  const [gigs, setGigs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [creatingGig, setCreatingGig] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async (searchTerm = "") => {
    setLoading(true);
    try {
      const res = await api.get("/gigs");
      let filteredGigs = res.data;
      
      // Filter by search term if provided
      if (searchTerm) {
        filteredGigs = filteredGigs.filter(g =>
          g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          g.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setGigs(filteredGigs);
    } catch (err) {
      console.error("Failed to fetch gigs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    if (e.target.value) {
      fetchGigs(e.target.value);
    } else {
      fetchGigs();
    }
  };

  const createGig = async (e) => {
    e.preventDefault();
    setError("");
    setCreatingGig(true);

    if (!title || !description || !budget) {
      setError("Please fill in all fields");
      setCreatingGig(false);
      return;
    }

    if (budget <= 0) {
      setError("Budget must be greater than 0");
      setCreatingGig(false);
      return;
    }

    try {
      await api.post("/gigs", { title, description, budget });
      setTitle("");
      setDescription("");
      setBudget("");
      setShowCreateForm(false);
      fetchGigs();
      alert("Gig created successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create gig");
    } finally {
      setCreatingGig(false);
    }
  };

  return (
    <div className="gigs-container">
      <div className="gigs-header">
        <h1>🚀 Available Gigs</h1>
        <div className="gigs-controls">
          <input
            type="text"
            placeholder="🔍 Search gigs..."
            value={search}
            onChange={handleSearch}
            className="search-input"
          />
          {user && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-primary"
            >
              {showCreateForm ? "Cancel" : "➕ Create Gig"}
            </button>
          )}
        </div>
      </div>

      {showCreateForm && user && (
        <div className="create-gig-form">
          <h2>Create a New Gig</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={createGig} className="form">
            <div className="form-group">
              <label>Gig Title</label>
              <input
                type="text"
                placeholder="e.g., Build a React website"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Describe your gig in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Budget ($)</label>
              <input
                type="number"
                placeholder="500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="form-input"
                min="1"
              />
            </div>

            <button type="submit" disabled={creatingGig} className="btn-primary">
              {creatingGig ? "Creating..." : "Create Gig"}
            </button>
          </form>
        </div>
      )}

      {loading && <div className="loading">Loading gigs...</div>}

      {!loading && gigs.length === 0 && (
        <div className="no-gigs">
          <p>😢 No gigs found. Try adjusting your search.</p>
        </div>
      )}

      <div className="gigs-grid">
        {gigs.map((gig) => (
          <div key={gig._id} className="gig-card">
            <div className="gig-status">{gig.status}</div>
            <h3 className="gig-title">{gig.title}</h3>
            <p className="gig-description">{gig.description.substring(0, 100)}...</p>
            
            <div className="gig-info">
              <div className="gig-budget">
                <span className="label">Budget:</span>
                <span className="price">${gig.budget}</span>
              </div>
              <div className="gig-owner">
                <span className="label">Posted by:</span>
                <span className="owner-name">{gig.ownerId?.name || "Unknown"}</span>
              </div>
            </div>

            <Link to={`/gig/${gig._id}`} className="btn-secondary">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
