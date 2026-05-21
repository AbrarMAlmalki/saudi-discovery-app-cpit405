// src/services/authService.js
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser, updateUser } from './databaseService';

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

const generateToken = (userId) => {
  return btoa(`${userId}-${Date.now()}-${Math.random()}`);
};

export const register = async (userData) => {
  try {
    // Validate password strength
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join('. '));
    }

    // Check if user exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: 'user',
      preferences: {
        sports: [],
        regions: []
      },
      createdAt: new Date().toISOString()
    };
    
    const createdUser = await createUser(newUser);
    const token = generateToken(createdUser.id);
    const { password, ...userWithoutPassword } = createdUser;
    
    return { user: userWithoutPassword, token };
  } catch (error) {
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    
    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, token };
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (userData) => {
  try {
    const updatedUser = await updateUser(userData.id, userData);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (token && user) {
    return JSON.parse(user);
  }
  return null;
};