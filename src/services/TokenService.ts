/**
 * TokenService - Centralized token management with multiple fallbacks
 * Solves the 401 authentication issue by ensuring token is always available
 * VERSION: 2.0 - FIXED VERSION WITH IMMEDIATE TOKEN AVAILABILITY
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '@redux/store';
 
class TokenService {
  private static token: string | null = null;
  private static isInitialized = false;
  private static readonly VERSION = '2.0-FIXED';

  /**
   * Initialize the service by loading token from storage
   */
  static async initialize(): Promise<void> {
 
    if (this.isInitialized) {
       return;
    }

    try {
      // Try to get token from AsyncStorage first (persisted across app restarts)
      const storedToken = await AsyncStorage.getItem('authToken');
      if (storedToken) {
        this.token = storedToken;
       } else {
       }
      this.isInitialized = true;
    } catch (error) {
       this.isInitialized = true; // Mark as initialized even on error
    }
  }

  /**
   * Set token in memory and storage
   */
  static async setToken(token: string): Promise<void> {
    // ✅ Validate token is a string
    if (!this.isValidToken(token)) {
       throw new Error(`Invalid token: expected string, got ${typeof token}`);
    }

 
    // Store in memory immediately
    this.token = token;

    // Store in AsyncStorage for persistence
    try {
      await AsyncStorage.setItem('authToken', token);
     } catch (error) {
     }
  }

  /**
   * Validate that token is a non-empty string
   */
  private static isValidToken(token:string): token is string {
    return typeof token === 'string' && token.length > 0;
  }

  /**
   * Get token with multiple fallbacks
   */
  static async getToken(): Promise<string | null> {
    // 1. Return memory token if available (fastest)
    if (this.token && this.isValidToken(this.token)) {
       return this.token;
    }

    // 2. Try Redux store (might have token from recent login)
    try {
      const state = store.getState();
      const reduxToken = state?.auth?.token;
      
      // ✅ CRITICAL: Validate token is a string, not an object
      if (reduxToken && this.isValidToken(reduxToken)) {
        this.token = reduxToken;
        
        // Save to AsyncStorage for next time
        try {
          await AsyncStorage.setItem('authToken', this.token);
        } catch (storageError) {
         }
        
        return this.token;
      } else if (reduxToken) {
       }
    } catch (error) {
     }

    // 3. Final fallback to AsyncStorage
    try {
      const asyncToken = await AsyncStorage.getItem('authToken');
      
      // ✅ Validate token from AsyncStorage
      if (asyncToken && this.isValidToken(asyncToken)) {
        this.token = asyncToken;
         return this.token;
      } else if (asyncToken) {
         // Clear invalid token
        await AsyncStorage.removeItem('authToken');
      }
    } catch (error) {
     }

    return null;
  }

  /**
   * Get token synchronously (from memory only)
   */
  static getTokenSync(): string | null {
    return this.token;
  }

  /**
   * Clear token from all sources
   */
  static async clearToken(): Promise<void> {
     this.token = null;
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
     }
  }

  /**
   * Wait for token to be available (with timeout)
   */
  static async waitForToken(maxAttempts = 50, delayMs = 100): Promise<string | null> {
 
    for (let i = 0; i < maxAttempts; i++) {
      const token = await this.getToken();
      if (token) {
         return token;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

     return null;
  }
}

export default TokenService;