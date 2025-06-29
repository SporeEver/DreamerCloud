import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('dreamercloud_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Set RevenueCat user ID
        await Purchases.logIn(userData.id);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      
      // Get existing users from storage
      const usersData = await AsyncStorage.getItem('dreamercloud_users');
      const users = usersData ? JSON.parse(usersData) : [];
      
      // Find existing user or create demo user
      let existingUser = users.find(u => u.email === email && u.password === password);
      
      if (!existingUser) {
        // Create demo user for any email/password combination
        existingUser = {
          id: Date.now().toString(),
          username: email.split('@')[0] || 'DreamUser',
          email,
          password,
          createdAt: new Date().toISOString(),
          dreamCount: 0,
          isSubscribed: false,
          subscriptionStatus: 'inactive'
        };
        
        users.push(existingUser);
        await AsyncStorage.setItem('dreamercloud_users', JSON.stringify(users));
      }

      const { password: _, ...userWithoutPassword } = existingUser;
      
      await AsyncStorage.setItem('dreamercloud_user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      
      // Set RevenueCat user ID
      await Purchases.logIn(userWithoutPassword.id);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username, email, password) => {
    try {
      setIsLoading(true);
      
      const usersData = await AsyncStorage.getItem('dreamercloud_users');
      const users = usersData ? JSON.parse(usersData) : [];
      
      // Check if user already exists
      if (users.find(u => u.email === email || u.username === username)) {
        return false;
      }

      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password,
        createdAt: new Date().toISOString(),
        dreamCount: 0,
        isSubscribed: false,
        subscriptionStatus: 'inactive'
      };

      users.push(newUser);
      await AsyncStorage.setItem('dreamercloud_users', JSON.stringify(users));

      const { password: _, ...userWithoutPassword } = newUser;
      await AsyncStorage.setItem('dreamercloud_user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      
      // Set RevenueCat user ID
      await Purchases.logIn(userWithoutPassword.id);
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('dreamercloud_user');
      await Purchases.logOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('dreamercloud_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};