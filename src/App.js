import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';
import Events from './components/events/Events';
import EventDetails from './components/events/EventDetails';
import TicketBooking from './components/events/TicketBooking';
import MyTickets from './components/pages/MyTickets';
import './styles/App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
              <Route path="/events/:id" element={<PrivateRoute><EventDetails /></PrivateRoute>} />
              <Route path="/booking/:eventId" element={<PrivateRoute><TicketBooking /></PrivateRoute>} />
              <Route path="/my-tickets" element={<PrivateRoute><MyTickets /></PrivateRoute>} />
              <Route path="/region/:regionName" element={<PrivateRoute><Events /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;