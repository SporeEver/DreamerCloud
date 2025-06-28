import { useState, useEffect } from 'react';
import { User, AuthState } from '../types';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('dreamercloud_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          isAuthenticated: true,
          user,
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('dreamercloud_user');
      }
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    try {
      // Get existing users from localStorage
      const users = JSON.parse(localStorage.getItem('dreamercloud_users') || '[]');
      
      // First, try to find an existing user with matching credentials
      const existingUser = users.find((u: User & { password: string }) => 
        u.email === email && u.password === password
      );

      if (existingUser) {
        // User exists, log them in
        const { password: _, ...userWithoutPassword } = existingUser;
        localStorage.setItem('dreamercloud_user', JSON.stringify(userWithoutPassword));
        setAuthState({
          isAuthenticated: true,
          user: userWithoutPassword,
        });
        return true;
      }

      // For demo purposes, create a user automatically if none exists with these credentials
      // This allows any email/password combination to work for the demo
      const demoUser: User & { password: string } = {
        id: Date.now().toString(),
        username: email.split('@')[0] || 'DreamUser',
        email,
        password,
        createdAt: new Date().toISOString(),
        dreamCount: 0,
      };

      // Add demo user to users list
      users.push(demoUser);
      localStorage.setItem('dreamercloud_users', JSON.stringify(users));

      // Set as current user
      const { password: _, ...userWithoutPassword } = demoUser;
      localStorage.setItem('dreamercloud_user', JSON.stringify(userWithoutPassword));
      setAuthState({
        isAuthenticated: true,
        user: userWithoutPassword,
      });
      return true;

    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = (username: string, email: string, password: string): boolean => {
    try {
      const users = JSON.parse(localStorage.getItem('dreamercloud_users') || '[]');
      
      // Check if user already exists
      if (users.find((u: User) => u.email === email || u.username === username)) {
        return false; // User already exists
      }

      const newUser: User & { password: string } = {
        id: Date.now().toString(),
        username,
        email,
        password,
        createdAt: new Date().toISOString(),
        dreamCount: 0,
      };

      users.push(newUser);
      localStorage.setItem('dreamercloud_users', JSON.stringify(users));

      const { password: _, ...userWithoutPassword } = newUser;
      localStorage.setItem('dreamercloud_user', JSON.stringify(userWithoutPassword));
      setAuthState({
        isAuthenticated: true,
        user: userWithoutPassword,
      });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('dreamercloud_user');
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
  };

  return {
    ...authState,
    login,
    signup,
    logout,
  };
};