import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../styles/GigDetails.css";

export default function GigDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchGigDetails();
  }, [id]);

  const fetchGigDetails = async () => {
    setLoading(true);
    try {
      // Fetch all gigs and find the one with matching ID
      const res = await api.get("/gigs");
      const foundGig = res.data.find(g => g._id === id);
      
      if (foundGig) {
        setGig(foundGig);
        setIsOwner(user && foundGig.ownerId._id === user._id);
        
        // Try to fetch bids if user is authenticated
        if (user) {
          try {
            const bidsRes = await api.get(`/bids/${id}`);
            setBids(bidsRes.data);
          } catch (err) {
            if (err.response?.status !== 403) {
              console.error("Failed to fetch bids");
            }
          }
        }
      } else {
        setError("Gig not found");
      }
    } catch (err) {
      console.error("Failed to fetch gig details", err);
      setError("Failed to load gig details");
    } finally {
      setLoading(false);
    }
  };

  const submitBid = async (e) => {
    e.preventDefault();
    setError("");
    setSubmittingBid(true);

    if (!user) {
      navigate("/login");
      return;
    }

    if (!message || !price) {
      setError("Please fill in all fields");
      setSubmittingBid(false);
      return;
    }

    if (price <= 0) {
      setError("Price must be greater than 0");
      setSubmittingBid(false);
      return;
    }

    try {
      await api.post("/bids", { gigId: id, message, price });
      setMessage("");
      setPrice("");
      fetchGigDetails();
      alert("Bid submitted successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit bid");
    } finally {
      setSubmittingBid(false);
    }
  };

  const hireBid = async (bidId) => {
    try {
      await api.patch(`/bids/${bidId}/hire`);
      fetchGigDetails();
      alert("Freelancer hired successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to hire freelancer");
    }
  };

  if (loading) return <div className="loading">Loading gig details...</div>;
  if (!gig) return (
    <div className="error-page">
      <button onClick={() => navigate("/gigs")} className="btn-back">← Back to Gigs</button>
      <p>Gig not found</p>
    </div>
  );

  return (
    <div className="gig-details-container">
      <button onClick={() => navigate("/gigs")} className="btn-back">
        ← Back to Gigs
      </button>

      <div className="gig-details-content">
        <div className="gig-main">
          <div className="gig-header">
            <h1>{gig.title}</h1>
            <span className={`status-badge ${gig.status}`}>{gig.status}</span>
          </div>

          <div className="gig-meta">
            <div className="meta-item">
              <span className="label">Posted by:</span>
              <span className="value">{gig.ownerId?.name || "Unknown"}</span>
            </div>
            <div className="meta-item">
              <span className="label">Email:</span>
              <span className="value">{gig.ownerId?.email}</span>
            </div>
            <div className="meta-item">
              <span className="label">Budget:</span>
              <span className="value budget">${gig.budget}</span>
            </div>
          </div>

          <div className="gig-description">
            <h3>Description</h3>
            <p>{gig.description}</p>
          </div>

          {gig.status === "open" && !isOwner && user && (
            <div className="bid-form-section">
              <h3>💰 Submit Your Bid</h3>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={submitBid} className="form">
                <div className="form-group">
                  <label>Your Bid Price ($)</label>
                  <input
                    type="number"
                    placeholder="Enter your bid price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-input"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Bid Message</label>
                  <textarea
                    placeholder="Explain why you're the best fit for this gig..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="form-input"
                    rows="4"
                  />
                </div>

                <button type="submit" disabled={submittingBid} className="btn-primary">
                  {submittingBid ? "Submitting..." : "Submit Bid"}
                </button>
              </form>
            </div>
          )}

          {gig.status === "open" && !user && (
            <div className="bid-form-section">
              <p>👤 Please <a href="/login">login</a> to submit a bid</p>
            </div>
          )}

          {gig.status === "assigned" && (
            <div className="gig-assigned">
              <p>✅ This gig has been assigned to <strong>{gig.hiredBidId?.freelancerId?.name || "a freelancer"}</strong></p>
            </div>
          )}
        </div>

        {isOwner && bids.length > 0 && (
          <div className="bids-section">
            <h3>📋 Bids Received ({bids.length})</h3>
            <div className="bids-list">
              {bids.map((bid) => (
                <div key={bid._id} className={`bid-card ${bid.status}`}>
                  <div className="bid-header">
                    <h4>{bid.freelancerId?.name}</h4>
                    <span className="bid-status">{bid.status}</span>
                  </div>
                  <p className="bid-price">💵 ${bid.price}</p>
                  <p className="bid-message">{bid.message}</p>
                  <div className="bid-email">
                    <span>📧 {bid.freelancerId?.email}</span>
                  </div>
                  
                  {gig.status === "open" && bid.status === "pending" && (
                    <button
                      onClick={() => hireBid(bid._id)}
                      className="btn-hire"
                    >
                      ✅ Hire This Freelancer
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isOwner && bids.length === 0 && gig.status === "open" && (
          <div className="no-bids">
            <p>No bids yet. Freelancers will start bidding soon! 👀</p>
          </div>
        )}
      </div>
    </div>
  );
}
