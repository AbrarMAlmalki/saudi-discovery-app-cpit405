// src/components/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getInstantImage, fetchSportImage, PexelsAttribution } from '../../services/pexelsService';
import { getEvents } from '../../services/eventService';
import AISportsChat from '../chat/AISportsChat';
import '../../styles/Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [heroImage, setHeroImage] = useState('');
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    loadHeroImage();
    loadUpcomingEvents();
  }, []);

  const loadHeroImage = async () => {
    const img = await fetchSportImage('Football', 'Riyadh');
    setHeroImage(img);
  };

  const loadUpcomingEvents = async () => {
    try {
      const events = await getEvents({});
      // Take first 4 upcoming events
      const topEvents = events.slice(0, 4);
      setUpcomingEvents(topEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      // Fallback events if API fails
      setUpcomingEvents([
        { id: '1', title: 'Al Hilal vs Al Nassr', sport: 'Football', date: '2026-05-15', time: '20:00', venue: 'King Fahd Stadium', price: { standard: 80 }, region: 'Riyadh' },
        { id: '2', title: 'Riyadh Marathon', sport: 'Athletics', date: '2026-05-20', time: '06:00', venue: 'King Saud University', price: { standard: 50 }, region: 'Riyadh' },
        { id: '3', title: 'Gamers8 Festival', sport: 'E-Sports', date: '2026-05-25', time: '14:00', venue: 'Boulevard City', price: { standard: 100 }, region: 'Riyadh' },
        { id: '4', title: 'Saudi Open', sport: 'Tennis', date: '2026-06-05', time: '16:00', venue: 'King Saud University', price: { standard: 120 }, region: 'Riyadh' }
      ]);
    }
  };

  const handleBookEvent = (eventId) => {
    if (isAuthenticated) {
      navigate(`/events/${eventId}`);
    } else {
      navigate('/login');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    };
  };

  const topSports = [
    { name: 'Football', icon: '⚽', color: '#22c55e', count: '156 Events' },
    { name: 'Basketball', icon: '🏀', color: '#f97316', count: '89 Events' },
    { name: 'Tennis', icon: '🎾', color: '#eab308', count: '67 Events' },
    { name: 'Swimming', icon: '🏊', color: '#06b6d4', count: '45 Events' },
    { name: 'E-Sports', icon: '🎮', color: '#a855f7', count: '34 Events' },
    { name: 'Athletics', icon: '🏃', color: '#ef4444', count: '28 Events' }
  ];

  const regions = [
    { name: 'Riyadh', icon: '🏛️', color: '#22c55e' },
    { name: 'Jeddah', icon: '🌊', color: '#06b6d4' },
    { name: 'Dammam', icon: '🏖️', color: '#f97316' },
    { name: 'Abha', icon: '⛰️', color: '#a855f7' }
  ];

  return (
    <div className="home-new">
      {/* Hero Section */}
      <div className="hero-new" style={{ backgroundImage: `linear-gradient(90deg, #0f0f1a 0%, #0f0f1a 50%, transparent 100%), url(${heroImage || getInstantImage('Football')})` }}>
        <div className="hero-new-content">
          <div className="hero-label">
            <span className="hero-label-dot"></span>
            SAUDI SPORTS HUB
          </div>
          <h1 className="hero-new-title">
            Find Your<br />
            <span className="hero-highlight">Next Game</span>
          </h1>
          <p className="hero-new-desc">
            Discover and book tickets for the biggest sporting events across Saudi Arabia.
            From local matches to international championships.
          </p>
          <div className="hero-buttons">
            <Link to={isAuthenticated ? "/events" : "/register"} className="btn-primary-new">
              Explore Events →
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">500+</span>
              <span className="stat-text">Events Yearly</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">50K+</span>
              <span className="stat-text">Athletes</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">2M+</span>
              <span className="stat-text">Fans</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events Section - WITH WORKING BOOK BUTTONS */}
      <div className="upcoming-new-section">
        <div className="container-new">
          <div className="section-header-new">
            <span className="section-badge-new">HAPPENING SOON</span>
            <h2>Upcoming Events</h2>
            <p>Don't miss these exciting matches</p>
          </div>
          <div className="events-new-list">
            {upcomingEvents.map((event, i) => {
              const dateObj = formatDate(event.date);
              return (
                <div key={event.id || i} className="event-new-card">
                  <div className="event-new-date">
                    <span className="event-day">{dateObj.day}</span>
                    <span className="event-month">{dateObj.month}</span>
                  </div>
                  <div className="event-new-details">
                    <div className="event-sport-badge" style={{ 
                      background: event.sport === 'Football' ? '#22c55e' : 
                                  event.sport === 'Athletics' ? '#ef4444' : 
                                  event.sport === 'E-Sports' ? '#a855f7' : 
                                  event.sport === 'Tennis' ? '#eab308' : '#06b6d4' 
                    }}>
                      {event.sport}
                    </div>
                    <h3>{event.title}</h3>
                    <div className="event-meta">
                      <span>⏰ {event.time}</span>
                      <span>📍 {event.venue}</span>
                    </div>
                  </div>
                  <div className="event-new-action">
                    <span className="event-price">{event.price.standard} SAR</span>
                    <button 
                      className="btn-event-book" 
                      onClick={() => handleBookEvent(event.id)}
                    >
                      Book →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Regions Section */}
      <div className="regions-new-section">
        <div className="container-new">
          <div className="section-header-new">
            <span className="section-badge-new">BY REGION</span>
            <h2>Events Near You</h2>
            <p>Discover what's happening in your city</p>
          </div>
          <div className="regions-new-grid">
            {regions.map((region, i) => (
              <div 
                key={i} 
                className="region-new-card"
                onClick={() => isAuthenticated ? navigate(`/region/${region.name}`) : navigate('/login')}
              >
                <div className="region-new-icon">{region.icon}</div>
                <h3>{region.name}</h3>
                <span className="region-new-link">Explore →</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="why-new-section">
        <div className="container-new">
          <div className="section-header-new">
            <span className="section-badge-new">WHY CHOOSE US?</span>
            <h2>Your Sports Destination</h2>
            <p>Everything you need in one place</p>
          </div>
          <div className="features-new-grid">
            <div className="feature-new-card">
              <div className="feature-new-icon">🎫</div>
              <h3>Easy Booking</h3>
              <p>Book tickets in seconds with our simple interface</p>
            </div>
            <div className="feature-new-card">
              <div className="feature-new-icon">🌤️</div>
              <h3>Live Updates</h3>
              <p>Real-time weather and event changes</p>
            </div>
            <div className="feature-new-card">
              <div className="feature-new-icon">🗺️</div>
              <h3>Interactive Maps</h3>
              <p>Find venues easily with Google Maps</p>
            </div>
            
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-new-section">
        <div className="cta-new-content">
          <h2>Ready for Game Day?</h2>
          <p>Join thousands of fans and experience the thrill of live sports</p>
          {!isAuthenticated && (
            <Link to="/register" className="btn-cta-new">
              Create Free Account →
            </Link>
          )}
        </div>
      </div>

      <PexelsAttribution />
         <AISportsChat />
    </div>
  );
};

export default Home;