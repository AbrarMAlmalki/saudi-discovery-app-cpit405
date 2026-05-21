import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, getMapUrl } from '../../services/eventService';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const data = await getEventById(id);
      setEvent(data);
      setError(null);
    } catch (err) {
      setError('Failed to load event details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


const handleBookTicket = () => {
  // Pass the full event data to the booking page
  navigate(`/booking/${event.id}`, { state: { event } });
};

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="error-container">
        <p>{error || 'Event not found'}</p>
        <button onClick={() => navigate('/events')} className="btn-primary">
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="event-details-container">
      <button onClick={() => navigate('/events')} className="back-button">
        ← Back to Events
      </button>
      
      <div className="event-details-content">
        <div className="event-details-main">
          {/* Image Gallery */}
          <div className="event-gallery">
            <div className="main-image">
              {!imageLoaded && <div className="image-placeholder-large"><div className="spinner"></div></div>}
              <img 
                src={event.images?.[selectedImage] || event.image} 
                alt={event.title}
                onLoad={() => setImageLoaded(true)}
                style={{ display: imageLoaded ? 'block' : 'none' }}
              />
            </div>
            {event.images && event.images.length > 1 && (
              <div className="thumbnail-gallery">
                {event.images.map((img, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${event.title} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="event-details-info">
            <h1>{event.title}</h1>
            <p className="event-description">{event.description}</p>
            
            <div className="event-info-grid">
              <div className="info-item">
                <span className="info-icon">🏟️</span>
                <div>
                  <strong>Venue</strong>
                  <p>{event.venue}</p>
                </div>
              </div>
              
              <div className="info-item">
                <span className="info-icon">📍</span>
                <div>
                  <strong>Location</strong>
                  <p>{event.city}, {event.region}</p>
                </div>
              </div>
              
              <div className="info-item">
                <span className="info-icon">📅</span>
                <div>
                  <strong>Date</strong>
                  <p>{formatDate(event.date)}</p>
                </div>
              </div>
              
              <div className="info-item">
                <span className="info-icon">⏰</span>
                <div>
                  <strong>Time</strong>
                  <p>{event.time}</p>
                </div>
              </div>
              
              <div className="info-item">
                <span className="info-icon">👥</span>
                <div>
                  <strong>Capacity</strong>
                  <p>{event.registered}/{event.capacity} participants</p>
                  <div className="capacity-bar">
                    <div 
                      className="capacity-fill" 
                      style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {event.weather && (
              <div className="weather-info">
                <h3>Weather Forecast</h3>
                <div className="weather-details">
                  <div className="weather-item">🌡️ {Math.round(event.weather.temperature)}°C</div>
                  <div className="weather-item">🌤️ {event.weather.condition}</div>
                  <div className="weather-item">💧 {event.weather.humidity}% humidity</div>
                  <div className="weather-item">💨 {event.weather.windSpeed} m/s wind</div>
                </div>
              </div>
            )}
            
            <div className="ticket-section">
              <h3>Ticket Prices</h3>
              <div className="price-options">
                <div className="price-card">
                  <h4>Standard</h4>
                  <p className="price">{event.price.standard} SAR</p>
                  <small>General Admission</small>
                </div>
                <div className="price-card vip">
                  <h4>VIP</h4>
                  <p className="price">{event.price.vip} SAR</p>
                  <small>Premium Seating + Gift</small>
                </div>
                <div className="price-card premium">
                  <h4>Premium</h4>
                  <p className="price">{event.price.premium} SAR</p>
                  <small>VIP Lounge + Meet & Greet</small>
                </div>
              </div>
              
              <button onClick={handleBookTicket} className="btn-primary book-btn">
                Book Tickets Now →
              </button>
            </div>
          </div>
        </div>
        
        <div className="event-details-sidebar">
          <div className="map-container">
            <h3>Event Location</h3>
            <iframe
              title="Event Location Map"
              src={getMapUrl(event.coordinates.lat, event.coordinates.lng)}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
          
          <div className="event-tips">
            <h3>Event Tips</h3>
            <ul>
              <li>✓ Arrive 30 minutes early</li>
              <li>✓ Bring your ID for registration</li>
              <li>✓ Wear appropriate sports attire</li>
              <li>✓ Stay hydrated</li>
              <li>✓ Follow event guidelines</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;