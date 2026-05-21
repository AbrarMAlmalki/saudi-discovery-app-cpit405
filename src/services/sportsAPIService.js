// src/services/sportsAPIService.js
// Dynamic events generator with persistent IDs

// Store generated events to maintain consistent IDs
let generatedEvents = null;
let eventMap = new Map();

// Saudi regions and their coordinates
const SAUDI_REGIONS = [
  { name: 'Riyadh', lat: 24.7136, lng: 46.6753 },
  { name: 'Makkah', lat: 21.3891, lng: 39.8579 },
  { name: 'Eastern Province', lat: 26.4207, lng: 50.0888 },
  { name: 'Al Madinah', lat: 24.5247, lng: 39.5692 },
  { name: 'Asir', lat: 18.2465, lng: 42.5117 },
  { name: 'Jeddah', lat: 21.5433, lng: 39.1728 },
  { name: 'Dammam', lat: 26.4207, lng: 50.0888 },
  { name: 'Abha', lat: 18.2465, lng: 42.5117 },
  { name: 'AlUla', lat: 26.6457, lng: 37.9151 }
];

// Sports categories
const SPORTS = [
  'Football', 'Athletics', 'Basketball', 'Tennis', 'Swimming', 
  'Cycling', 'E-Sports', 'Volleyball', 'Running', 'Traditional'
];

// Venues by region
const VENUES = {
  'Riyadh': ['King Fahd Stadium', 'Kingdom Arena', 'Prince Faisal Stadium', 'King Saud University Arena'],
  'Jeddah': ['King Abdullah Sports City', 'Prince Abdullah Al Faisal Stadium', 'Red Sea Arena'],
  'Dammam': ['Prince Mohamed bin Fahd Stadium', 'Half Moon Bay', 'Dammam Sports Hall'],
  'Makkah': ['King Abdulaziz Stadium', 'Makkah Sports Complex'],
  'Al Madinah': ['Prince Mohammed Stadium', 'AlUla Desert Arena'],
  'Asir': ['Prince Sultan Stadium', 'Asir National Park'],
  'Abha': ['Abha Sports Stadium', 'Asir Mountain Arena'],
  'AlUla': ['AlUla Desert Arena', 'Winter Park'],
  'Eastern Province': ['Half Moon Bay Beach', 'Dammam Stadium']
};

// Generate a random future date (within next 90 days)
const generateFutureDate = () => {
  const today = new Date();
  const futureDays = Math.floor(Math.random() * 90) + 7;
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + futureDays);
  return futureDate.toISOString().split('T')[0];
};

// Generate random time
const generateTime = () => {
  const hours = Math.floor(Math.random() * 14) + 8;
  const minutes = Math.random() > 0.5 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

// Generate random price
const generatePrice = (sport) => {
  const basePrice = {
    'Football': { standard: 80, vip: 250, premium: 500 },
    'E-Sports': { standard: 100, vip: 300, premium: 600 },
    'Athletics': { standard: 50, vip: 150, premium: 300 },
    'Basketball': { standard: 60, vip: 180, premium: 350 },
    'Tennis': { standard: 70, vip: 200, premium: 400 },
    'Swimming': { standard: 40, vip: 120, premium: 250 },
    'Cycling': { standard: 60, vip: 180, premium: 350 },
    'Volleyball': { standard: 45, vip: 140, premium: 280 },
    'Running': { standard: 35, vip: 100, premium: 200 },
    'Traditional': { standard: 30, vip: 90, premium: 180 }
  };
  return basePrice[sport] || { standard: 50, vip: 150, premium: 300 };
};

// Generate participants
const generateParticipants = (capacity) => {
  return Math.floor(Math.random() * capacity * 0.7) + Math.floor(capacity * 0.1);
};

// Get random item
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Get venue
const getVenue = (region) => {
  const venues = VENUES[region] || VENUES['Riyadh'];
  return randomItem(venues);
};

// Get coordinates
const getCoordinates = (region) => {
  const found = SAUDI_REGIONS.find(r => r.name === region);
  return found || { lat: 24.7136, lng: 46.6753 };
};

// Generate event title
const generateTitle = (sport, region) => {
  const titles = {
    'Football': [`${region} Derby`, `${region} Championship`, `Pro League: ${region} Match`, `International Friendly`],
    'Athletics': [`${region} Marathon`, `${region} Track & Field`, `Athletics Grand Prix`, `National Championships`],
    'E-Sports': [`${region} Gaming Fest`, `E-Sports World Cup Qualifier`, `Pro Gaming Tournament`, `Digital Sports Championship`],
    'Basketball': [`${region} Slam Dunk`, `Basketball Championship`, `Pro League Finals`, `International Cup`],
    'Tennis': [`${region} Open`, `Tennis Masters`, `ATP Challenger`, `International Championship`],
    'Swimming': [`${region} Swim Cup`, `Open Water Challenge`, `National Swimming Champs`, `Aquatic Festival`],
    'Cycling': [`${region} Cycling Tour`, `Mountain Bike Challenge`, `Road Race Championship`, `Desert Cycling`],
    'Volleyball': [`${region} Beach Volley`, `Volleyball Nationals`, `Pro League Match`, `International Series`],
    'Running': [`${region} Fun Run`, `Ultra Marathon`, `City Run`, `Charity Race`],
    'Traditional': [`${region} Camel Festival`, `Horse Racing Cup`, `Traditional Sports Day`, `Heritage Games`]
  };
  return randomItem(titles[sport] || [`${sport} Event in ${region}`]);
};

// Generate description
const generateDescription = (sport, region) => {
  const descriptions = {
    'Football': `Experience the excitement of professional football in ${region}. Top teams compete for glory in this must-see match.`,
    'Athletics': `Watch world-class athletes compete in track and field events. Records could be broken at this exciting competition.`,
    'E-Sports': `Elite gamers battle for supremacy and massive prize pools. The ultimate test of skill and strategy.`,
    'Basketball': `Fast-paced basketball action featuring top Saudi and international players. Don't miss the slam dunks!`,
    'Tennis': `Professional tennis at its finest. Watch powerful serves and incredible rallies in this prestigious tournament.`,
    'Swimming': `Elite swimmers compete in pool and open water events. Witness speed and endurance at its peak.`,
    'Cycling': `Challenging routes through beautiful ${region} landscapes. Professional cyclists push their limits.`,
    'Volleyball': `Exciting volleyball action featuring powerful spikes and incredible saves. Beach or indoor format.`,
    'Running': `Join hundreds of runners in this exciting race. Categories for all levels from beginners to pros.`,
    'Traditional': `Experience authentic Saudi sporting traditions. A cultural celebration of athletic heritage.`
  };
  return descriptions[sport] || `Join us for an exciting ${sport} event in ${region}. Professional athletes and great atmosphere guaranteed!`;
};

// Generate consistent IDs (not random each time)
let idCounter = 1;
const generateConsistentId = () => {
  return `evt_${(idCounter++).toString().padStart(3, '0')}`;
};

// Main function to generate all events (runs once, caches results)
export const fetchAllEvents = async () => {
  // Return cached events if they exist
  if (generatedEvents) {
    return generatedEvents;
  }
  
  console.log('Generating dynamic sports events (cached)...');
  
  const events = [];
  const eventCount = 30;
  
  for (let i = 0; i < eventCount; i++) {
    const sport = randomItem(SPORTS);
    const region = randomItem(SAUDI_REGIONS).name;
    const date = generateFutureDate();
    const time = generateTime();
    const venue = getVenue(region);
    const capacity = Math.floor(Math.random() * 30000) + 5000;
    const price = generatePrice(sport);
    const registered = generateParticipants(capacity);
    const title = generateTitle(sport, region);
    const description = generateDescription(sport, region);
    const coordinates = getCoordinates(region);
    const eventId = generateConsistentId();
    
    const event = {
      id: eventId,
      title: title,
      description: description,
      sport: sport,
      region: region,
      city: region,
      venue: venue,
      date: date,
      time: time,
      price: price,
      capacity: capacity,
      registered: registered,
      coordinates: coordinates,
      organizer: `Saudi ${sport} Federation`,
      category: Math.random() > 0.7 ? 'International' : 'Domestic',
      status: 'upcoming'
    };
    
    events.push(event);
    eventMap.set(eventId, event);
  }
  
  // Sort by date
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  generatedEvents = events;
  console.log(`✅ Generated ${events.length} dynamic events with consistent IDs`);
  return events;
};

// Get event by ID (FIXED)
export const getEventById = async (id) => {
  // Ensure events are generated first
  if (!generatedEvents) {
    await fetchAllEvents();
  }
  
  const event = eventMap.get(id);
  if (event) {
    console.log(`Found event: ${event.title}`);
    return event;
  }
  
  console.log(`Event not found with ID: ${id}`);
  console.log('Available IDs:', Array.from(eventMap.keys()));
  return null;
};

// Get events by region
export const fetchEventsByRegion = async (region) => {
  const allEvents = await fetchAllEvents();
  return allEvents.filter(event => event.region === region);
};

// Get events by sport
export const fetchEventsBySport = async (sport) => {
  const allEvents = await fetchAllEvents();
  return allEvents.filter(event => event.sport === sport);
};

// Search events
export const searchEvents = async (query) => {
  const allEvents = await fetchAllEvents();
  const lowerQuery = query.toLowerCase();
  return allEvents.filter(event =>
    event.title.toLowerCase().includes(lowerQuery) ||
    event.description.toLowerCase().includes(lowerQuery) ||
    event.sport.toLowerCase().includes(lowerQuery) ||
    event.region.toLowerCase().includes(lowerQuery)
  );
};

// Get upcoming events only
export const getUpcomingEvents = async () => {
  const allEvents = await fetchAllEvents();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return allEvents.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });
};

// Get all unique regions
export const getAllRegionsFromEvents = async () => {
  const events = await fetchAllEvents();
  return [...new Set(events.map(event => event.region))];
};

// Get all unique sports
export const getAllSportsFromEvents = async () => {
  const events = await fetchAllEvents();
  return [...new Set(events.map(event => event.sport))];
};

// Refresh events (clear cache)
export const refreshEvents = async () => {
  generatedEvents = null;
  eventMap.clear();
  idCounter = 1;
  return await fetchAllEvents();
};