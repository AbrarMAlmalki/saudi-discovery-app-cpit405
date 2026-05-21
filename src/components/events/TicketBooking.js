// src/components/events/TicketBooking.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createBooking } from '../../services/ticketService';
import '../../styles/TicketBooking.css';

const TicketBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const event = location.state?.event;
  
  const [ticketType, setTicketType] = useState('standard');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');

  if (!event) {
    navigate('/events');
    return null;
  }

  const ticketTypes = [
    { id: 'standard', name: 'Standard', price: event.price.standard, color: '#22c55e', icon: '🎫', features: ['General Admission', 'Standard Seating', 'Event Access'] },
    { id: 'vip', name: 'VIP', price: event.price.vip, color: '#f97316', icon: '⭐', features: ['Premium Seating', 'Free Parking', 'Event Gift', 'Fast Entry'] },
    { id: 'premium', name: 'Premium', price: event.price.premium, color: '#a855f7', icon: '👑', features: ['VIP Lounge Access', 'Meet & Greet', 'Signed Merchandise', 'Food & Beverages'] }
  ];

  const selectedTicket = ticketTypes.find(t => t.id === ticketType);
  const totalPrice = selectedTicket.price * quantity;

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleBooking = async () => {
    setLoading(true);
    
    const result = await createBooking(
      user.id,
      event.id,
      ticketType,
      quantity,
      event
    );
    
    if (result.success) {
      setBookingDetails(result.ticket);
      setBookingComplete(true);
    } else {
      alert('Booking failed. Please try again.');
    }
    
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (bookingComplete) {
    return (
      <div className="booking-success-page">
        <div className="success-container">
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h1>Booking Confirmed!</h1>
            <p>Your tickets have been booked successfully.</p>
            
            <div className="booking-summary-card">
              <h3>Booking Summary</h3>
              <div className="summary-row">
                <span>Booking ID:</span>
                <strong>{bookingDetails?.id}</strong>
              </div>
              <div className="summary-row">
                <span>Event:</span>
                <strong>{bookingDetails?.eventTitle}</strong>
              </div>
              <div className="summary-row">
                <span>Date:</span>
                <strong>{bookingDetails?.eventDate && formatDate(bookingDetails.eventDate)}</strong>
              </div>
              <div className="summary-row">
                <span>Time:</span>
                <strong>{bookingDetails?.eventTime}</strong>
              </div>
              <div className="summary-row">
                <span>Venue:</span>
                <strong>{bookingDetails?.venue}</strong>
              </div>
              <div className="summary-row">
                <span>Ticket Type:</span>
                <strong className="capitalize">{bookingDetails?.ticketType}</strong>
              </div>
              <div className="summary-row">
                <span>Quantity:</span>
                <strong>×{bookingDetails?.quantity}</strong>
              </div>
              <div className="summary-row total">
                <span>Total Paid:</span>
                <strong>{bookingDetails?.totalPrice} SAR</strong>
              </div>
            </div>
            
            <div className="qr-section">
              <div className="qr-code-display">
                <img src={bookingDetails?.qrCode} alt="QR Code" />
              </div>
              <p className="qr-instruction">Scan this QR code at the venue entrance</p>
            </div>
            
            <div className="success-actions">
             <button 
    onClick={() => navigate('/profile', { state: { openTickets: true } })} 
    className="btn-view-tickets"
  >
    View My Tickets
  </button>
  <button onClick={() => navigate('/events')} className="btn-browse-more">
    Browse More Events
  </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      {/* Header */}
      <div className="booking-header">
        <div className="booking-header-content">
          <div className="booking-badge">
            <span className="badge-dot-booking"></span>
            COMPLETE YOUR BOOKING
          </div>
          <h1 className="booking-title">Secure Your Tickets</h1>
          <p className="booking-subtitle">Choose your ticket type and complete the booking</p>
        </div>
      </div>

      <div className="booking-container-new">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="back-button-booking">
          ← Back to Event
        </button>

        <div className="booking-layout">
          {/* Left Column - Ticket Selection */}
          <div className="booking-main">
            {/* Event Summary Card */}
            <div className="event-summary-card">
              <div className="event-summary-header">
                <span className="event-sport-badge" style={{ 
                  background: event.sport === 'Football' ? '#22c55e' : 
                              event.sport === 'Athletics' ? '#ef4444' : 
                              event.sport === 'E-Sports' ? '#a855f7' : '#f97316' 
                }}>
                  {event.sport}
                </span>
                <span className="event-date-badge">
                  📅 {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <h2 className="event-summary-title">{event.title}</h2>
              <div className="event-summary-details">
                <div className="summary-detail">
                  <span>📍</span>
                  <span>{event.venue}, {event.city}</span>
                </div>
                <div className="summary-detail">
                  <span>⏰</span>
                  <span>{event.time}</span>
                </div>
                <div className="summary-detail">
                  <span>👥</span>
                  <span>{event.registered}/{event.capacity} registered</span>
                </div>
              </div>
            </div>

            {/* Ticket Selection */}
            <div className="ticket-selection-card">
              <h3>Select Ticket Type</h3>
              <div className="ticket-options-booking">
                {ticketTypes.map(type => (
                  <div 
                    key={type.id}
                    className={`ticket-option-booking ${ticketType === type.id ? 'selected' : ''}`}
                    onClick={() => setTicketType(type.id)}
                    style={{ '--ticket-color': type.color }}
                  >
                    <div className="ticket-option-header">
                      <div className="ticket-option-icon">{type.icon}</div>
                      <div className="ticket-option-info">
                        <h4>{type.name}</h4>
                        <p className="ticket-option-price">{type.price} SAR</p>
                      </div>
                      <div className="ticket-option-radio">
                        <div className={`radio-btn ${ticketType === type.id ? 'active' : ''}`}>
                          {ticketType === type.id && <div className="radio-dot"></div>}
                        </div>
                      </div>
                    </div>
                    <div className="ticket-option-features">
                      {type.features.map((feature, i) => (
                        <span key={i}>✓ {feature}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="quantity-card">
              <h3>Select Quantity</h3>
              <div className="quantity-selector">
                <button 
                  className="quantity-btn" 
                  onClick={() => handleQuantityChange(-1)} 
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="quantity-number">{quantity}</span>
                <button 
                  className="quantity-btn" 
                  onClick={() => handleQuantityChange(1)} 
                  disabled={quantity >= 10}
                >
                  +
                </button>
              </div>
              <p className="quantity-limit">Maximum 10 tickets per booking</p>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="booking-sidebar">
            <div className="order-summary-card">
              <h3>Order Summary</h3>
              
              <div className="order-items">
                <div className="order-item">
                  <div className="order-item-info">
                    <span className="order-item-name">{selectedTicket.name} Ticket</span>
                    <span className="order-item-quantity">×{quantity}</span>
                  </div>
                  <span className="order-item-price">{selectedTicket.price * quantity} SAR</span>
                </div>
              </div>
              
              <div className="order-divider"></div>
              
              <div className="order-total">
                <span>Total Amount</span>
                <span className="total-price">{totalPrice} SAR</span>
              </div>
              
              {/* Payment Method */}
              <div className="payment-section">
                <h4>Payment Method</h4>
                <div className="payment-options">
                  <label className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>💳 Credit Card</span>
                  </label>
                  <label className={`payment-option ${paymentMethod === 'mada' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="mada"
                      checked={paymentMethod === 'mada'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>🏦 Mada Card</span>
                  </label>
                  <label className={`payment-option ${paymentMethod === 'apple' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="apple"
                      checked={paymentMethod === 'apple'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>📱 Apple Pay</span>
                  </label>
                </div>
              </div>
              
              <button 
                className="confirm-booking-btn" 
                onClick={handleBooking}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Confirm Booking • ${totalPrice} SAR`}
              </button>
              
              <p className="booking-note">
                By confirming your booking, you agree to our Terms of Service and Cancellation Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketBooking;