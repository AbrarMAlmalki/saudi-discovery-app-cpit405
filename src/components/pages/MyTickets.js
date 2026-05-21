// src/components/pages/MyTickets.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserBookings, cancelBooking } from '../../services/ticketService';
import '../../styles/MyTickets.css';

const MyTickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    if (user) {
      const userTickets = await getUserBookings(user.id);
      setTickets(userTickets);
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      const result = await cancelBooking(bookingId);
      if (result.success) {
        loadTickets();
        alert('Booking cancelled successfully');
      }
    }
  };

  const handleViewQR = (ticket) => {
    setSelectedTicket(ticket);
    setShowQR(true);
  };

  const getStatusBadge = (status) => {
    if (status === 'confirmed') {
      return <span className="ticket-status-badge confirmed">✓ Confirmed</span>;
    } else if (status === 'cancelled') {
      return <span className="ticket-status-badge cancelled">✗ Cancelled</span>;
    }
    return <span className="ticket-status-badge pending">⏳ Pending</span>;
  };

  const getTicketTypeClass = (type) => {
    switch(type) {
      case 'vip': return 'ticket-type-vip';
      case 'premium': return 'ticket-type-premium';
      default: return 'ticket-type-standard';
    }
  };

  const getSportColor = (sport) => {
    const colors = {
      'Football': '#22c55e',
      'Athletics': '#ef4444',
      'E-Sports': '#a855f7',
      'Volleyball': '#f97316',
      'Running': '#06b6d4',
      'Cycling': '#3b82f6',
      'Traditional': '#eab308',
      'Swimming': '#14b8a6',
      'Tennis': '#ec4899',
      'Basketball': '#f97316'
    };
    return colors[sport] || '#22c55e';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      full: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      formatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  };

  const filteredTickets = tickets.filter(ticket => {
    if (activeFilter === 'all') return true;
    return ticket.status === activeFilter;
  });

  const stats = {
    total: tickets.length,
    confirmed: tickets.filter(t => t.status === 'confirmed').length,
    cancelled: tickets.filter(t => t.status === 'cancelled').length,
    totalSpent: tickets.reduce((sum, t) => sum + (t.status === 'confirmed' ? t.totalPrice : 0), 0)
  };

  if (loading) {
    return (
      <div className="mytickets-loading">
        <div className="loading-spinner-mytickets"></div>
        <p>Loading your tickets...</p>
      </div>
    );
  }

  return (
    <div className="mytickets-page">
      {/* Header Section */}
      <div className="mytickets-header">
        <div className="mytickets-header-content">
          <div className="mytickets-badge">
            <span className="badge-dot-mytickets"></span>
            MY TICKETS
          </div>
          <h1 className="mytickets-title">
            Your Ticket Collection
          </h1>
          <p className="mytickets-subtitle">
            View and manage all your booked event tickets
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {tickets.length > 0 && (
        <div className="mytickets-stats">
          <div className="stat-card-mytickets">
            <div className="stat-icon">🎫</div>
            <div className="stat-info">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Tickets</div>
            </div>
          </div>
          <div className="stat-card-mytickets">
            <div className="stat-icon">✓</div>
            <div className="stat-info">
              <div className="stat-value">{stats.confirmed}</div>
              <div className="stat-label">Confirmed</div>
            </div>
          </div>
          <div className="stat-card-mytickets">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalSpent} SAR</div>
              <div className="stat-label">Total Spent</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {tickets.length > 0 && (
        <div className="mytickets-filters">
          <button 
            className={`filter-btn-mytickets ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Tickets ({stats.total})
          </button>
          <button 
            className={`filter-btn-mytickets ${activeFilter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('confirmed')}
          >
            Confirmed ({stats.confirmed})
          </button>
          <button 
            className={`filter-btn-mytickets ${activeFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveFilter('cancelled')}
          >
            Cancelled ({stats.cancelled})
          </button>
        </div>
      )}

      {/* Tickets Grid */}
      <div className="mytickets-content">
        {filteredTickets.length === 0 ? (
          <div className="no-tickets-mytickets">
            <div className="no-tickets-icon-mytickets">🎫</div>
            <h3>No Tickets Found</h3>
            <p>
              {activeFilter !== 'all' 
                ? `You don't have any ${activeFilter} tickets.`
                : "You haven't booked any tickets yet. Start exploring events!"}
            </p>
            <button onClick={() => navigate('/events')} className="btn-browse-mytickets">
              Browse Events →
            </button>
          </div>
        ) : (
          <div className="tickets-grid-mytickets">
            {filteredTickets.map((ticket) => {
              const dateObj = formatDate(ticket.eventDate);
              return (
                <div key={ticket.id} className={`ticket-card-mytickets ${getTicketTypeClass(ticket.ticketType)}`}>
                  {/* Ticket Stub (decorative) */}
                  <div className="ticket-stub-mytickets"></div>
                  
                  <div className="ticket-content-mytickets">
                    {/* Ticket Header */}
                    <div className="ticket-header-mytickets">
                      <div className="ticket-event-category">
                        {ticket.eventTitle.split(' ')[0]}
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>
                    
                    {/* Event Title */}
                    <h3 className="ticket-event-title">{ticket.eventTitle}</h3>
                    
                    {/* Event Details */}
                    <div className="ticket-event-details">
                      <div className="ticket-detail-row">
                        <span className="detail-icon-mytickets">📅</span>
                        <span>{dateObj.formatted}</span>
                      </div>
                      <div className="ticket-detail-row">
                        <span className="detail-icon-mytickets">⏰</span>
                        <span>{ticket.eventTime}</span>
                      </div>
                      <div className="ticket-detail-row">
                        <span className="detail-icon-mytickets">📍</span>
                        <span>{ticket.venue}, {ticket.region}</span>
                      </div>
                      <div className="ticket-detail-row">
                        <span className="detail-icon-mytickets">🎫</span>
                        <span className="ticket-type-badge-mytickets">
                          {ticket.ticketType.toUpperCase()}
                        </span>
                      </div>
                      <div className="ticket-detail-row">
                        <span className="detail-icon-mytickets">👥</span>
                        <span>Quantity: {ticket.quantity}</span>
                      </div>
                      <div className="ticket-detail-row">
                        <span className="detail-icon-mytickets">💰</span>
                        <span className="ticket-price-mytickets">{ticket.totalPrice} SAR</span>
                      </div>
                      <div className="ticket-detail-row">
                        <span className="detail-icon-mytickets">🆔</span>
                        <span className="ticket-id-mytickets">ID: {ticket.id}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="ticket-actions-mytickets">
                      <button 
                        className="btn-view-qr-mytickets" 
                        onClick={() => handleViewQR(ticket)}
                      >
                        📱 View QR Code
                      </button>
                      {ticket.status === 'confirmed' && (
                        <button 
                          className="btn-cancel-mytickets" 
                          onClick={() => handleCancelBooking(ticket.id)}
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQR && selectedTicket && (
        <div className="qr-modal-mytickets" onClick={() => setShowQR(false)}>
          <div className="qr-modal-content-mytickets" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-mytickets" onClick={() => setShowQR(false)}>✕</button>
            <div className="qr-modal-icon">🎟️</div>
            <h3>Your Ticket QR Code</h3>
            <div className="qr-code-container-mytickets">
              <img src={selectedTicket.qrCode} alt="Ticket QR Code" />
            </div>
            <div className="ticket-info-modal-mytickets">
              <div className="modal-info-row">
                <span className="modal-info-label">Event:</span>
                <span className="modal-info-value">{selectedTicket.eventTitle}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-info-label">Date:</span>
                <span className="modal-info-value">{formatDate(selectedTicket.eventDate).formatted}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-info-label">Time:</span>
                <span className="modal-info-value">{selectedTicket.eventTime}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-info-label">Venue:</span>
                <span className="modal-info-value">{selectedTicket.venue}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-info-label">Ticket Type:</span>
                <span className="modal-info-value capitalize">{selectedTicket.ticketType}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-info-label">Quantity:</span>
                <span className="modal-info-value">×{selectedTicket.quantity}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-info-label">Booking ID:</span>
                <span className="modal-info-value booking-id">{selectedTicket.id}</span>
              </div>
            </div>
            <p className="qr-note-mytickets">Show this QR code at the venue entrance for entry</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTickets;