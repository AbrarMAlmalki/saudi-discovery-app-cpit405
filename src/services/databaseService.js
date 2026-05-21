// src/services/databaseService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});


// Get user by email
export const getUserByEmail = async (email) => {
  try {
    const response = await api.get(`/users?email=${email}`);
    return response.data[0] || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
};

// Create new user
export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.patch(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// Get all users
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// ============ TICKET FUNCTIONS ============

// Save a new ticket to database
export const saveTicketToDatabase = async (ticketData) => {
  try {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  } catch (error) {
    console.error('Error saving ticket to database:', error);
    return null;
  }
};

// Get all tickets for a specific user
export const getUserTicketsFromDatabase = async (userId) => {
  try {
    const response = await api.get(`/tickets?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    return [];
  }
};

// Get a single ticket by ID
export const getTicketByIdFromDatabase = async (ticketId) => {
  try {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return null;
  }
};

// Update ticket status (cancel, confirm, etc.)
export const updateTicketStatusInDatabase = async (ticketId, status) => {
  try {
    const response = await api.patch(`/tickets/${ticketId}`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return null;
  }
};

// Cancel a ticket
export const cancelTicketInDatabase = async (ticketId) => {
  try {
    const response = await api.patch(`/tickets/${ticketId}`, { 
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    return null;
  }
};

// ============ BOOKING FUNCTIONS ============

// Save booking record
export const saveBookingToDatabase = async (bookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error saving booking:', error);
    return null;
  }
};

// Get user's booking history
export const getUserBookingsFromDatabase = async (userId) => {
  try {
    const response = await api.get(`/bookings?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return [];
  }
};

// ============ HELPER FUNCTIONS ============

// Generate unique ID
export const generateTicketId = () => {
  return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
};

// Generate QR code URL
export const generateQRCode = (data) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data}`;
};

// Generate seat numbers
export const generateSeats = (quantity, ticketType) => {
  const sections = {
    standard: ['A', 'B', 'C'],
    vip: ['D', 'E', 'F'],
    premium: ['G', 'H', 'J']
  };
  
  const availableSections = sections[ticketType] || sections.standard;
  const seats = [];
  
  for (let i = 0; i < quantity; i++) {
    const section = availableSections[Math.floor(Math.random() * availableSections.length)];
    const row = Math.floor(Math.random() * 15) + 1;
    const seat = Math.floor(Math.random() * 20) + 1;
    seats.push(`${section}${row}-${seat}`);
  }
  return seats;
};

// Complete booking process - saves everything to database
export const completeTicketBooking = async (userId, eventDetails, ticketType, quantity) => {
  try {
    const ticketId = generateTicketId();
    const bookingId = `BKG-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const totalPrice = eventDetails.price[ticketType] * quantity;
    
    // 1. Create ticket record
    const ticket = {
      id: ticketId,
      userId: userId,
      eventId: eventDetails.id,
      eventTitle: eventDetails.title,
      eventDate: eventDetails.date,
      eventTime: eventDetails.time,
      venue: eventDetails.venue,
      region: eventDetails.region,
      sport: eventDetails.sport,
      ticketType: ticketType,
      quantity: quantity,
      pricePerTicket: eventDetails.price[ticketType],
      totalPrice: totalPrice,
      bookingDate: new Date().toISOString(),
      status: 'confirmed',
      qrCode: generateQRCode(ticketId),
      seats: generateSeats(quantity, ticketType)
    };
    
    // Save ticket to database
    const savedTicket = await saveTicketToDatabase(ticket);
    
    if (!savedTicket) {
      throw new Error('Failed to save ticket');
    }
    
    // 2. Create booking record
    const booking = {
      id: bookingId,
      userId: userId,
      eventId: eventDetails.id,
      ticketId: ticketId,
      bookingDate: new Date().toISOString(),
      paymentMethod: 'credit_card',
      status: 'completed',
      totalAmount: totalPrice
    };
    
    // Save booking to database
    await saveBookingToDatabase(booking);
    
    return {
      success: true,
      ticket: savedTicket,
      booking: booking,
      message: 'Tickets booked successfully!'
    };
    
  } catch (error) {
    console.error('Error completing booking:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to complete booking. Please try again.'
    };
  }
};