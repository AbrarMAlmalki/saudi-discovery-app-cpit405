// src/components/auth/Profile.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserBookings, cancelBooking } from '../../services/ticketService';
import '../../styles/Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'tickets', 'preferences'
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    preferences: user?.preferences || { sports: [], regions: [] }
  });
  const [updating, setUpdating] = useState(false);

  // Check if we should open tickets tab from navigation state
  useEffect(() => {
    if (location.state?.openTickets) {
      setActiveTab('tickets');
    }
  }, [location.state]);

  // Load tickets when component mounts or when tickets tab is opened
  useEffect(() => {
    if (activeTab === 'tickets' || location.state?.openTickets) {
      loadTickets();
    }
  }, [activeTab, user]);

  const loadTickets = async () => {
    if (user) {
      setLoadingTickets(true);
      const tickets = await getUserBookings(user.id);
      setMyTickets(tickets);
      setLoadingTickets(false);
    }
  };

  const handleCancelTicket = async (ticketId) => {
    if (window.confirm('Are you sure you want to cancel this ticket?')) {
      const result = await cancelBooking(ticketId);
      if (result.success) {
        loadTickets();
        alert('Ticket cancelled successfully');
      } else {
        alert(result.message || 'Failed to cancel ticket');
      }
    }
  };

  const handleViewQR = (ticket) => {
    setSelectedTicket(ticket);
    setShowQR(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'confirmed') {
      return <span className="status-badge confirmed">✓ Confirmed</span>;
    }
    return <span className="status-badge cancelled">✗ Cancelled</span>;
  };

  // Handle profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const result = await updateProfile({
      id: user.id,
      ...formData
    });
    if (result.success) {
      setIsEditing(false);
    }
    setUpdating(false);
  };

  const handlePreferenceToggle = (type, value) => {
    setFormData(prev => {
      const currentPrefs = prev.preferences[type];
      const updatedPrefs = currentPrefs.includes(value)
        ? currentPrefs.filter(p => p !== value)
        : [...currentPrefs, value];
      
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [type]: updatedPrefs
        }
      };
    });
  };

  const sportsOptions = ['Football', 'Athletics', 'E-Sports', 'Volleyball', 'Running', 'Cycling', 'Traditional', 'Swimming', 'Tennis', 'Basketball'];
  const regionsOptions = ['Riyadh', 'Makkah', 'Eastern Province', 'Al Madinah', 'Asir', 'Jeddah', 'Dammam', 'Abha'];

  return (
    <div className="profile-page-new">
      {/* Profile Header */}
      <div className="profile-header-new">
        <div className="profile-header-content">
          <div className="profile-badge">
            <span className="badge-dot-profile"></span>
            MY ACCOUNT
          </div>
          <h1 className="profile-title">{user?.name}</h1>
          <p className="profile-subtitle">Manage your profile and view your tickets</p>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile Info
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('tickets');
            loadTickets();
          }}
        >
          🎟️ My Tickets ({myTickets.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          ⚙️ Preferences
        </button>
      </div>

      {/* Profile Info Tab */}
      {activeTab === 'profile' && (
        <div className="profile-tab-content">
          {!isEditing ? (
            <div className="profile-info-card">
              <div className="profile-info-header">
                <h3>Personal Information</h3>
                <button onClick={() => setIsEditing(true)} className="btn-edit-profile">
                  Edit Profile ✎
                </button>
              </div>
              <div className="profile-info-details">
                <div className="info-row">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{user?.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{user?.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Member Since</span>
                  <span className="info-value">{new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Account Status</span>
                  <span className="info-value active-status">● Active</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="profile-edit-form">
              <div className="form-group-profile">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="profile-actions">
                <button type="submit" className="btn-save-profile" disabled={updating}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel-profile">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* My Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="profile-tab-content">
          <div className="my-tickets-section">
            <h3>🎟️ My Tickets</h3>
            
            {loadingTickets ? (
              <div className="loading-tickets">
                <div className="spinner-small"></div>
                <p>Loading your tickets...</p>
              </div>
            ) : myTickets.length === 0 ? (
              <div className="no-tickets-profile">
                <div className="no-tickets-icon">🎫</div>
                <p>You haven't booked any tickets yet.</p>
                <button onClick={() => window.location.href = '/events'} className="btn-browse-events">
                  Browse Events →
                </button>
              </div>
            ) : (
              <div className="tickets-list-profile">
                {myTickets.map((ticket) => (
                  <div key={ticket.id} className="ticket-item-profile">
                    <div className="ticket-header-profile">
                      <div className="ticket-event-info">
                        <h4>{ticket.eventTitle}</h4>
                        <div className="ticket-meta-profile">
                          <span>📅 {formatDate(ticket.eventDate)}</span>
                          <span>⏰ {ticket.eventTime}</span>
                          <span>📍 {ticket.venue}</span>
                        </div>
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <div className="ticket-details-profile">
                      <div className="ticket-detail">
                        <span className="detail-label">Ticket Type:</span>
                        <span className="detail-value capitalize">{ticket.ticketType}</span>
                      </div>
                      <div className="ticket-detail">
                        <span className="detail-label">Quantity:</span>
                        <span className="detail-value">×{ticket.quantity}</span>
                      </div>
                      
                      <div className="ticket-detail">
                        <span className="detail-label">Total:</span>
                        <span className="detail-value price">{ticket.totalPrice} SAR</span>
                      </div>
                      <div className="ticket-detail">
                        <span className="detail-label">Ticket ID:</span>
                        <span className="detail-value ticket-id">{ticket.id}</span>
                      </div>
                    </div>
                    <div className="ticket-actions-profile">
                      <button className="btn-view-qr" onClick={() => handleViewQR(ticket)}>
                        📱 View QR Code
                      </button>
                      {ticket.status === 'confirmed' && (
                        <button className="btn-cancel-ticket" onClick={() => handleCancelTicket(ticket.id)}>
                          Cancel Ticket
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="profile-tab-content">
          <div className="preferences-card">
            <div className="preferences-section">
              <h3>🏅 Favorite Sports</h3>
              <p className="preferences-desc">Select sports you're interested in to get personalized recommendations</p>
              <div className="preferences-tags">
                {sportsOptions.map(sport => (
                  <label key={sport} className={`pref-tag ${formData.preferences.sports.includes(sport) ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.preferences.sports.includes(sport)}
                      onChange={() => handlePreferenceToggle('sports', sport)}
                    />
                    {sport}
                  </label>
                ))}
              </div>
            </div>

            <div className="preferences-section">
              <h3>📍 Preferred Regions</h3>
              <p className="preferences-desc">Select regions to discover events near you</p>
              <div className="preferences-tags">
                {regionsOptions.map(region => (
                  <label key={region} className={`pref-tag ${formData.preferences.regions.includes(region) ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.preferences.regions.includes(region)}
                      onChange={() => handlePreferenceToggle('regions', region)}
                    />
                    {region}
                  </label>
                ))}
              </div>
            </div>

            <div className="preferences-actions">
              <button onClick={handleSubmit} className="btn-save-preferences">
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && selectedTicket && (
        <div className="qr-modal" onClick={() => setShowQR(false)}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowQR(false)}>✕</button>
            <h3>Your Ticket QR Code</h3>
            <div className="qr-code-display">
              <img src={selectedTicket.qrCode} alt="QR Code" />
            </div>
            <div className="ticket-info">
              <p><strong>Event:</strong> {selectedTicket.eventTitle}</p>
              <p><strong>Date:</strong> {formatDate(selectedTicket.eventDate)}</p>
              <p><strong>Ticket ID:</strong> {selectedTicket.id}</p>
            </div>
            <p className="qr-note">Show this at the venue entrance</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;