import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'campus_carpool_access_token';

// expo-secure-store has no web implementation, so the browser build falls back to localStorage.
export const tokenStorage =
  Platform.OS === 'web'
    ? {
        async getToken(): Promise<string | null> {
          return window.localStorage.getItem(ACCESS_TOKEN_KEY);
        },
        async setToken(token: string): Promise<void> {
          window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
        },
        async clearToken(): Promise<void> {
          window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        },
      }
    : {
        async getToken(): Promise<string | null> {
          return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        },
        async setToken(token: string): Promise<void> {
          await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
        },
        async clearToken(): Promise<void> {
          await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        },
      };
