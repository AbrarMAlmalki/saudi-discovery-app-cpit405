// src/components/events/EventCard.js
import React, { useState } from 'react';
import '../../styles/EventCard.css';

const EventCard = ({ event, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getSportIcon = (sport) => {
    const icons = {
      'Football': '⚽',
      'Athletics': '🏃',
      'E-Sports': '🎮',
      'Volleyball': '🏐',
      'Running': '🏃‍♂️',
      'Cycling': '🚴',
      'Traditional': '🐪',
      'Swimming': '🏊',
      'Tennis': '🎾',
      'Basketball': '🏀'
    };
    return icons[sport] || '⚽';
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
      full: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
  };

  const dateObj = formatDate(event.date);

  return (
    <div className="event-card-new" onClick={() => onClick(event.id)}>
      <div className="event-card-image-new">
        {!imageLoaded && !imageError && (
          <div className="card-image-placeholder">
            <div className="placeholder-spinner"></div>
          </div>
        )}
        <img 
          src={event.image} 
          alt={event.title}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
        {imageError && (
          <div className="card-image-fallback" style={{ background: getSportColor(event.sport) }}>
            {getSportIcon(event.sport)}
          </div>
        )}
        <div className="event-date-new">
          <span className="date-day">{dateObj.day}</span>
          <span className="date-month">{dateObj.month}</span>
        </div>
        <div className="event-sport-new" style={{ background: getSportColor(event.sport) }}>
          {getSportIcon(event.sport)} {event.sport}
        </div>
      </div>
      
      <div className="event-card-content-new">
        <h3 className="event-title-new">{event.title}</h3>
        <p className="event-description-new">{event.description.substring(0, 100)}...</p>
        
        <div className="event-info-new">
          <div className="event-info-item">
            <span className="info-icon">⏰</span>
            <span>{event.time}</span>
          </div>
          <div className="event-info-item">
            <span className="info-icon">📍</span>
            <span>{event.region}</span>
          </div>
          <div className="event-info-item">
            <span className="info-icon">💰</span>
            <span>From {event.price.standard} SAR</span>
          </div>
        </div>
        
        <div className="event-footer-new">
          <div className="event-capacity-new">
            <div className="capacity-bar-new">
              <div 
                className="capacity-fill-new" 
                style={{ width: `${(event.registered / event.capacity) * 100}%`, background: getSportColor(event.sport) }}
              ></div>
            </div>
            <span>{event.registered}/{event.capacity} registered</span>
          </div>
          
          {event.weather && (
            <div className="event-weather-new">
              🌡️ {Math.round(event.weather.temperature)}°C
            </div>
          )}
        </div>
        
        <button className="view-details-new" style={{ borderColor: getSportColor(event.sport), color: getSportColor(event.sport) }}>
          View Details →
        </button>
      </div>
    </div>
  );
};

export default EventCard;