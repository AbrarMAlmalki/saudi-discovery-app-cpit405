// src/services/pexelsService.js

const PEXELS_API_KEY = 'eAbnu9oWBmnVKwItyBLzj8xclrZ9zvgzmRTOThu8WQR8plTEJX9bN5aK'; // Get free from https://www.pexels.com/api/
const PEXELS_API_URL = 'https://api.pexels.com/v1';

// Cache images in localStorage to avoid API limits
const imageCache = new Map();

const getCachedImage = (cacheKey) => {
  const cached = localStorage.getItem(`pexels_${cacheKey}`);
  if (cached) {
    const { url, timestamp } = JSON.parse(cached);
    // Cache expires after 7 days
    if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
      return url;
    }
  }
  return null;
};

const setCachedImage = (cacheKey, url) => {
  localStorage.setItem(`pexels_${cacheKey}`, JSON.stringify({
    url,
    timestamp: Date.now()
  }));
  imageCache.set(cacheKey, url);
};

// Sport-specific search queries
const sportQueries = {
  'Football': 'football stadium match',
  'Athletics': 'athletics track running',
  'E-Sports': 'esports gaming tournament',
  'Volleyball': 'beach volleyball',
  'Running': 'marathon runners',
  'Cycling': 'mountain biking race',
  'Traditional': 'camel racing',
  'Swimming': 'swimming competition pool',
  'Tennis': 'tennis match court'
};

// Preloaded fallback images (load instantly while API fetches)
const FALLBACK_IMAGES = {
  'Football': 'https://images.pexels.com/photos/4679103/pexels-photo-4679103.jpeg?w=400&h=300&fit=crop',
  'Athletics': 'https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg?w=400&h=300&fit=crop',
  'E-Sports': 'https://images.pexels.com/photos/7395011/pexels-photo-7395011.jpeg?w=400&h=300&fit=crop',
  'Volleyball': 'https://images.pexels.com/photos/1712277/pexels-photo-1712277.jpeg?w=400&h=300&fit=crop',
  'Running': 'https://images.pexels.com/photos/235922/pexels-photo-235922.jpeg?w=400&h=300&fit=crop',
  'Cycling': 'https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg?w=400&h=300&fit=crop',
  'Traditional': 'https://images.pexels.com/photos/5322538/pexels-photo-5322538.jpeg?w=400&h=300&fit=crop',
  'Swimming': 'https://images.pexels.com/photos/1093411/pexels-photo-1093411.jpeg?w=400&h=300&fit=crop',
  'Tennis': 'https://images.pexels.com/photos/12420588/pexels-photo-12420588.jpeg?w=400&h=300&fit=crop'
};

// Get instant fallback image (no loading time)
export const getInstantImage = (sport) => {
  return FALLBACK_IMAGES[sport] || FALLBACK_IMAGES['Football'];
};

// Search for photos by query
export const searchPhotos = async (query, perPage = 1) => {
  const cacheKey = `search_${query}`;
  const cached = getCachedImage(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${PEXELS_API_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      const imageUrl = data.photos[0].src.large || data.photos[0].src.medium;
      setCachedImage(cacheKey, imageUrl);
      return imageUrl;
    }
    
    return getInstantImage(query);
  } catch (error) {
    console.error('Pexels search error:', error);
    return getInstantImage(query);
  }
};

// Get curated/trending photos
export const getCuratedPhotos = async (perPage = 20) => {
  const cacheKey = `curated_${perPage}`;
  const cached = getCachedImage(cacheKey);
  if (cached && Array.isArray(cached)) return cached;

  try {
    const response = await fetch(
      `${PEXELS_API_URL}/curated?per_page=${perPage}`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrls = data.photos.map(photo => photo.src.large);
    
    setCachedImage(cacheKey, imageUrls);
    return imageUrls;
  } catch (error) {
    console.error('Pexels curated error:', error);
    return [];
  }
};

// Get photo by ID
export const getPhotoById = async (photoId) => {
  try {
    const response = await fetch(`${PEXELS_API_URL}/photos/${photoId}`, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      url: data.src.large,
      photographer: data.photographer,
      photographerUrl: data.photographer_url,
      alt: data.alt
    };
  } catch (error) {
    console.error('Pexels getPhotoById error:', error);
    return null;
  }
};

// Main function for your sports events (returns image URL instantly)
export const fetchSportImage = async (sport, region = null) => {
  const cacheKey = `${sport}-${region || 'default'}`;
  
  // Check cache first
  const cachedUrl = getCachedImage(cacheKey);
  if (cachedUrl) {
    return cachedUrl;
  }
  
  // Get fallback image immediately (so UI doesn't wait)
  const fallbackUrl = getInstantImage(sport);
  
  // Build search query
  let query = sportQueries[sport] || `${sport} sport`;
  if (region) {
    query = `${query} ${region}`;
  }
  
  // Fetch in background and update cache (no await - don't block)
  searchPhotos(query, 1).then(imageUrl => {
    if (imageUrl && imageUrl !== fallbackUrl) {
      setCachedImage(cacheKey, imageUrl);
      // Dispatch event to refresh images that are still loading
      window.dispatchEvent(new CustomEvent('imageUpdated', { detail: { sport, imageUrl } }));
    }
  }).catch(console.error);
  
  // Return fallback immediately (fast!)
  return fallbackUrl;
};

// Fetch gallery images (multiple images for event details)
export const fetchEventGallery = async (sport, region, count = 5) => {
  const query = sportQueries[sport] || `${sport} sport`;
  const fullQuery = region ? `${query} ${region}` : query;
  
  const cacheKey = `gallery_${fullQuery}`;
  const cached = getCachedImage(cacheKey);
  if (cached && Array.isArray(cached)) return cached;
  
  try {
    const response = await fetch(
      `${PEXELS_API_URL}/search?query=${encodeURIComponent(fullQuery)}&per_page=${Math.min(count, 10)}`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY
        }
      }
    );

    if (!response.ok) throw new Error('Pexels API error');

    const data = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      const gallery = data.photos.slice(0, count).map(photo => photo.src.large);
      setCachedImage(cacheKey, gallery);
      return gallery;
    }
    
    // Return fallback images
    return Array(count).fill(getInstantImage(sport));
  } catch (error) {
    console.error('Pexels gallery error:', error);
    return Array(count).fill(getInstantImage(sport));
  }
};

// ============================================
// ADD THIS PexelsAttribution COMPONENT HERE
// ============================================
export const PexelsAttribution = () => (
  <div style={{ textAlign: 'center', padding: '10px', fontSize: '12px', color: '#999' }}>
    <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" style={{ color: '#999', textDecoration: 'none' }}>
      Photos provided by Pexels
    </a>
  </div>
);