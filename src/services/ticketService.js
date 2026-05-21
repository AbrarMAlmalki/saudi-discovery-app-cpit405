// src/services/ticketService.js
import { 
  getUserTicketsFromDatabase, 
  completeTicketBooking,
  cancelTicketInDatabase,
  getTicketByIdFromDatabase,
  getUserBookingsFromDatabase
} from './databaseService';

// Get all tickets for the current user
export const getUserTickets = async (userId) => {
  try {
    const tickets = await getUserTicketsFromDatabase(userId);
    return tickets;
  } catch (error) {
    console.error('Error getting user tickets:', error);
    return [];
  }
};

// Get user bookings (for Profile.js)
export const getUserBookings = async (userId) => {
  try {
    const tickets = await getUserTicketsFromDatabase(userId);
    return tickets;
  } catch (error) {
    console.error('Error getting user bookings:', error);
    return [];
  }
};

// Book tickets - saves to database
export const bookTickets = async (userId, eventDetails, ticketType, quantity) => {
  try {
    const result = await completeTicketBooking(userId, eventDetails, ticketType, quantity);
    return result;
  } catch (error) {
    console.error('Error booking tickets:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to book tickets. Please try again.'
    };
  }
};

// Cancel a ticket
export const cancelTicket = async (ticketId) => {
  try {
    const cancelledTicket = await cancelTicketInDatabase(ticketId);
    return { 
      success: true, 
      ticket: cancelledTicket,
      message: 'Ticket cancelled successfully' 
    };
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to cancel ticket. Please try again.'
    };
  }
};

// Cancel booking (for Profile.js)
export const cancelBooking = async (bookingId) => {
  try {
    const cancelledTicket = await cancelTicketInDatabase(bookingId);
    return { 
      success: true, 
      message: 'Booking cancelled successfully' 
    };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to cancel booking. Please try again.'
    };
  }
};

// Get a specific ticket by ID
export const getTicket = async (ticketId) => {
  try {
    const ticket = await getTicketByIdFromDatabase(ticketId);
    return ticket;
  } catch (error) {
    console.error('Error getting ticket:', error);
    return null;
  }
};

// Get booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const ticket = await getTicketByIdFromDatabase(bookingId);
    return ticket;
  } catch (error) {
    console.error('Error getting booking:', error);
    return null;
  }
};

// Create booking (for TicketBooking.js)
export const createBooking = async (userId, eventId, ticketType, quantity, eventDetails) => {
  try {
    const result = await completeTicketBooking(userId, eventDetails, ticketType, quantity);
    return result;
  } catch (error) {
    console.error('Error creating booking:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to create booking. Please try again.'
    };
  }
};