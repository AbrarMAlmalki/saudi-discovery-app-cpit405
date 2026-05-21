// src/components/events/Events.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getEvents, getAllSports, getAllRegions, refreshEvents, getEventsByRegion } from '../../services/eventService';
import EventCard from './EventCard';
import '../../styles/Events.css';

const Events = () => {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    sport: 'all',
    region: 'all',
    search: ''
  });
  
  const [sports, setSports] = useState([]);
  const [regions, setRegions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const { regionName } = useParams();
  const navigate = useNavigate();

  // Define loadEvents as useCallback
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEvents(filters);
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('Failed to load events. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Define loadEventsByRegion as useCallback
  const loadEventsByRegion = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEventsByRegion(regionName);
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('Failed to load events for this region.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [regionName]);

  // Load sports and regions
  const loadSportsAndRegions = useCallback(async () => {
    const sportsList = await getAllSports();
    const regionsList = await getAllRegions();
    setSports(sportsList);
    setRegions(regionsList);
  }, []);

  useEffect(() => {
    loadSportsAndRegions();
  }, [loadSportsAndRegions]);

  useEffect(() => {
    if (regionName) {
      loadEventsByRegion();
      setFilters(prev => ({ ...prev, region: regionName }));
    } else {
      loadEvents();
    }
  }, [filters.sport, filters.region, filters.search, regionName, loadEvents, loadEventsByRegion]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshEvents();
    if (regionName) {
      await loadEventsByRegion();
    } else {
      await loadEvents();
    }
    setRefreshing(false);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const clearFilters = () => {
    setFilters({ sport: 'all', region: 'all', search: '' });
    if (regionName) {
      navigate('/events');
    }
  };

  if (loading) {
    return (
      <div className="events-loading-new">
        <div className="loading-spinner-new"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-error-new">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
        <button onClick={regionName ? loadEventsByRegion : loadEvents} className="btn-retry-new">Try Again</button>
      </div>
    );
  }

  return (
    <div className="events-page-new">
      {/* Header Section */}
      <div className="events-header-new">
        <div className="events-header-content">
          <div className="events-badge">
            <span className="badge-dot"></span>
            {regionName ? `EVENTS IN ${regionName.toUpperCase()}` : 'ALL EVENTS'}
          </div>
          <h1 className="events-title">
            {regionName ? `${regionName} Events` : 'Discover Sporting Events'}
          </h1>
          <p className="events-subtitle">
            {regionName 
              ? `Find and join exciting sporting events happening in ${regionName}`
              : 'Find and join exciting sporting events across Saudi Arabia'
            }
          </p>
          
          {/* Refresh Button */}
          <button onClick={handleRefresh} className="refresh-btn-new" disabled={refreshing}>
            <span className="refresh-icon">🔄</span>
            {refreshing ? 'Refreshing...' : 'Refresh Events'}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar-new">
        <div className="filter-bar-container">
          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <span>🔍</span> Filters
            <span className="filter-count">
              {(filters.sport !== 'all' || filters.region !== 'all' || filters.search) ? '1' : '0'}
            </span>
          </button>
          
          {(filters.sport !== 'all' || filters.region !== 'all' || filters.search) && (
            <button onClick={clearFilters} className="clear-filters-new">
              Clear All ✕
            </button>
          )}
        </div>
        
        {showFilters && (
          <div className="filters-panel-new">
            <div className="filter-group-new">
              <label>Sport</label>
              <select name="sport" value={filters.sport} onChange={handleFilterChange}>
                <option value="all">All Sports</option>
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group-new">
              <label>Region</label>
              <select name="region" value={filters.region} onChange={handleFilterChange}>
                <option value="all">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group-new search-group">
              <label>Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search events by name, sport, or location..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="results-count-new">
        Found <span className="count-number">{events.length}</span> {events.length === 1 ? 'event' : 'events'}
      </div>

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="events-grid-new">
          {events.map(event => (
            <EventCard key={event.id} event={event} onClick={handleEventClick} />
          ))}
        </div>
      ) : (
        <div className="no-results-new">
          <div className="no-results-icon">🎯</div>
          <h3>No events found</h3>
          <p>Try adjusting your filters or check back later for new events</p>
          <button onClick={clearFilters} className="btn-clear-new">Clear Filters</button>
        </div>
      )}
    </div>
  );
};

export default Events;