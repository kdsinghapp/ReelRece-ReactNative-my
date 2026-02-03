import React, { FunctionComponent, useEffect } from 'react';
import { LogBox, NativeModules, Platform, Text, TextInput } from 'react-native';
import 'react-native-gesture-handler';
import AppNavigator from './src/navigators/AppNavigator'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeLoggerConsoleBridge, setSuppressAllLogs } from '@utils/LoggerConsoleBridge';

// ✅ STEP 1: Suppress LogBox visual warnings (yellow/red boxes)
LogBox.ignoreAllLogs(true);

// ✅ STEP 2: Suppress ALL console logs globally (including Metro/terminal output)
// Set to true in production, false in development if you want to see logs
if (!__DEV__) {
  setSuppressAllLogs(true);
}

// ✅ STEP 3: Initialize the logger bridge (with suppression already configured)
initializeLoggerConsoleBridge();

// Default props
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;
TextInput.defaultProps.underlineColorAndroid = "transparent";

// ✅ QueryClient created ONCE outside component (singleton pattern)
// This ensures caching behavior is preserved across re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000,      // 10 minutes - garbage collection time (was cacheTime)
      retry: 2,                     // Retry failed requests 2 times
      refetchOnWindowFocus: false,  // Don't refetch when app comes to foreground
      refetchOnReconnect: true,     // Refetch when network reconnects
    },
    mutations: {
      retry: 1,                     // Retry failed mutations once
    },
  },
});

const App: FunctionComponent = () => {

  // ✅ Cache trim effect - Android only, with graceful error handling
  useEffect(() => {
    const trimCacheOnAndroid = async () => {
      // Only run on Android
      if (Platform.OS !== 'android') {
        return;
      }

      try {
        const { AndroidExoPlayerCache } = NativeModules;
        
        // Check if module exists
        if (!AndroidExoPlayerCache?.trimCache) {
          if (__DEV__) {
            console.warn('AndroidExoPlayerCache module not available');
          }
          return;
        }

        // Trim cache to 100MB
        await AndroidExoPlayerCache.trimCache(100 * 1024 * 1024);
        
        if (__DEV__) {
          console.log('Cache trimmed successfully',__DEV__);
        }
      } catch (error) {
        // ✅ Graceful failure - don't crash the app
        if (__DEV__) {
          console.warn('Cache trim failed (non-critical):', error);
        }
        // Silently fail in production - cache trim is not critical
      }
    };

    trimCacheOnAndroid();
  }, []);

  return (
    <QueryClientProvider client={queryClient}> 
      <AppNavigator />
    </QueryClientProvider>
  );
}

export default App;

// quavuwozoiwe-6484@yopmail.com
// 123456