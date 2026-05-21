// src/services/eventService.js
import axios from 'axios';
import { fetchSportImage, getInstantImage } from './pexelsService';
import { fetchAllEvents, getEventById as getEventByIdFromAPI } from './sportsAPIService';


// weather API
const WEATHER_API_KEY = 'f64ca673f93e137825549902bb1963d9';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

// Cache for events to reduce API calls
let eventsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getWeatherForLocation = async (lat, lon) => {
  try {
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'f64ca673f93e137825549902bb1963d9') {
      return getMockWeather();
    }
    
    const response = await axios.get(`${WEATHER_API_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });
    
    return {
      temperature: response.data.main.temp,
      condition: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      icon: response.data.weather[0].icon
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return getMockWeather();
  }
};

const getMockWeather = () => {
  return {
    temperature: Math.floor(Math.random() * (38 - 20 + 1) + 20),
    condition: ['Sunny', 'Clear Sky', 'Partly Cloudy', 'Mild', 'Warm'][Math.floor(Math.random() * 5)],
    humidity: Math.floor(Math.random() * (65 - 25 + 1) + 25),
    windSpeed: Math.floor(Math.random() * (25 - 5 + 1) + 5),
  };
};

//google map API
export const getMapUrl = (lat, lng, zoom = 13) => {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
};


export const getEvents = async (filters = {}) => {
  try {
    // Check cache
    const now = Date.now();
    if (eventsCache && (now - lastFetchTime) < CACHE_DURATION) {
      console.log('Using cached events');
      return applyFilters(eventsCache, filters);
    }
    
    console.log('Fetching fresh events from APIs...');
    
    // Fetch events from external APIs
    let allEvents = await fetchAllEvents();
    
    // Get only upcoming events (current + future)
    const upcomingEvents = allEvents.filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    });
    
    // Add images to events
    const eventsWithImages = await Promise.all(
      upcomingEvents.map(async (event) => {
        try {
          const imageUrl = await fetchSportImage(event.sport, event.region);
          const weather = await getWeatherForLocation(event.coordinates.lat, event.coordinates.lng);
          return { ...event, image: imageUrl, weather };
        } catch (error) {
          return { ...event, image: getInstantImage(event.sport), weather: null };
        }
      })
    );
    
    // Update cache
    eventsCache = eventsWithImages;
    lastFetchTime = now;
    
    return applyFilters(eventsWithImages, filters);
    
  } catch (error) {
    console.error('Error in getEvents:', error);
    return [];
  }
};

const applyFilters = (events, filters) => {
  let filtered = [...events];
  
  if (filters.sport && filters.sport !== 'all') {
    filtered = filtered.filter(e => e.sport === filters.sport);
  }
  
  if (filters.region && filters.region !== 'all') {
    filtered = filtered.filter(e => e.region === filters.region);
  }
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(e => 
      e.title.toLowerCase().includes(searchLower) ||
      e.description.toLowerCase().includes(searchLower) ||
      e.sport.toLowerCase().includes(searchLower)
    );
  }
  
  return filtered;
};

// Get single event by ID - FIXED 
export const getEventById = async (id) => {
  try {
    // First try to get from the sportsAPIService
    const event = await getEventByIdFromAPI(id);
    
    if (event) {
      const imageUrl = await fetchSportImage(event.sport, event.region);
      const weather = await getWeatherForLocation(event.coordinates.lat, event.coordinates.lng);
      return { ...event, image: imageUrl, weather };
    }
    throw new Error('Event not found');
  } catch (error) {
    console.error('Error getting event by ID:', error);
    return null;
  }
};

// Get events by region
export const getEventsByRegion = async (regionName) => {
  try {
    const allEvents = await fetchAllEvents();
    const regionEvents = allEvents.filter(event => event.region === regionName);
    
    const eventsWithImages = await Promise.all(
      regionEvents.map(async (event) => {
        const imageUrl = await fetchSportImage(event.sport, event.region);
        const weather = await getWeatherForLocation(event.coordinates.lat, event.coordinates.lng);
        return { ...event, image: imageUrl, weather };
      })
    );
    
    return eventsWithImages;
  } catch (error) {
    console.error('Error getting events by region:', error);
    return [];
  }
};

// Get all unique regions from events
export const getAllRegions = async () => {
  try {
    const events = await fetchAllEvents();
    const regions = [...new Set(events.map(event => event.region))];
    return regions;
  } catch (error) {
    return ['Riyadh', 'Makkah', 'Eastern Province', 'Al Madinah', 'Asir'];
  }
};

// Get all unique sports from events
export const getAllSports = async () => {
  try {
    const events = await fetchAllEvents();
    const sports = [...new Set(events.map(event => event.sport))];
    return sports;
  } catch (error) {
    return ['Football', 'Athletics', 'Basketball', 'Tennis', 'Swimming', 'Cycling'];
  }
};

// Force refresh events (clear cache)
export const refreshEvents = async () => {
  console.log('Refreshing events...');
  eventsCache = null;
  lastFetchTime = 0;
  return await getEvents({});
};

// Register for an event
export const registerForEvent = async (eventId, userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Successfully registered for event!'
      });
    }, 500);
  });
};