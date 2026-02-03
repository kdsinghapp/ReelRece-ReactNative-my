import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Alert, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { CacheManager } from './CacheManager'; // Ya jahan aapka CacheManager hai

const CacheManagerUI = () => {
  const [cacheInfo, setCacheInfo] = useState({
    size: 0,
    status: 'Checking...',
    lastCleanup: null,
    isLoading: true
  });

  const cacheManager = new CacheManager();

  useEffect(() => {
    initializeCacheMonitoring();
  }, []);

  const initializeCacheMonitoring = async () => {
    try {
      await checkCache();
    } catch (error) {
     }
  };

  const checkCache = async () => {
    try {
      setCacheInfo(prev => ({ ...prev, isLoading: true }));
      
      const result = await cacheManager.monitorCache();
      
      setCacheInfo({
        size: result.cleaned ? result.newSize : result.currentSize,
        status: result.cleaned ? 'Cleaned' : 'Within Limits',
        lastCleanup: result.cleaned ? new Date() : cacheInfo.lastCleanup,
        isLoading: false
      });

      if (result.cleaned) {
        Alert.alert(
          'Cache Cleaned Automatically',
          `Cache was automatically cleaned. Removed ${result.details.removedCount} files.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
       setCacheInfo(prev => ({
        ...prev,
        status: 'Error',
        isLoading: false
      }));
    }
  };

  const manualCleanup = async () => {
    try {
      setCacheInfo(prev => ({ ...prev, isLoading: true }));
      
      const result = await cacheManager.clearOldCache();
      const newSize = await cacheManager.getTotalCacheSize();
      
      setCacheInfo({
        size: newSize / (1024 * 1024),
        status: 'Manually Cleaned',
        lastCleanup: new Date(),
        isLoading: false
      });

      Alert.alert(
        'Cache Cleaned Successfully',
        `Removed ${result.removedCount} files\nFreed ${(result.removedSize / (1024 * 1024)).toFixed(2)} MB`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      setCacheInfo(prev => ({ ...prev, isLoading: false }));
      Alert.alert('Error', 'Failed to clean cache');
     }
  };

  const clearAllCache = async () => {
    Alert.alert(
      'Clear All Cache',
      'Are you sure you want to clear ALL cache? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              setCacheInfo(prev => ({ ...prev, isLoading: true }));
              
              await cacheManager.clearAllCache();
              const newSize = await cacheManager.getTotalCacheSize();
              
              setCacheInfo({
                size: newSize / (1024 * 1024),
                status: 'All Cleared',
                lastCleanup: new Date(),
                isLoading: false
              });

              Alert.alert('Success', 'All cache cleared successfully');
            } catch (error) {
              setCacheInfo(prev => ({ ...prev, isLoading: false }));
              }
          }
        }
      ]
    );
  };

  const getStatusColor = () => {
    switch(cacheInfo.status) {
      case 'Within Limits': return '#4CAF50';
      case 'Cleaned': return '#FF9800';
      case 'Manually Cleaned': return '#2196F3';
      case 'All Cleared': return '#9C27B0';
      case 'Error': return '#F44336';
      default: return '#757575';
    }
  };

  const getSizeColor = () => {
    const size = cacheInfo.size;
    if (size < 30) return '#4CAF50';
    if (size < 50) return '#FF9800';
    return '#F44336';
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={cacheInfo.isLoading} onRefresh={checkCache} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cache Manager</Text>
        <Text style={styles.headerSubtitle}>Manage your app storage efficiently</Text>
      </View>

      {/* Cache Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Cache Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Current Size:</Text>
          <Text style={[styles.infoValue, { color: getSizeColor() }]}>
            {cacheInfo.size.toFixed(2)} MB
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{cacheInfo.status}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Cleanup:</Text>
          <Text style={styles.infoValue}>
            {cacheInfo.lastCleanup 
              ? cacheInfo.lastCleanup.toLocaleString() 
              : 'Never'
            }
          </Text>
        </View>

        <View style={styles.limitInfo}>
          <Text style={styles.limitText}>
            • Auto cleanup at: 60MB{'\n'}
            • Removes: 50% old files
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]}
          onPress={checkCache}
          disabled={cacheInfo.isLoading}
        >
          {cacheInfo.isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>Check Cache Now</Text>
              <Text style={styles.buttonSubtext}>Refresh current status</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={manualCleanup}
          disabled={cacheInfo.isLoading}
        >
          <Text style={styles.buttonText}>Manual Cleanup (50%)</Text>
          <Text style={styles.buttonSubtext}>Remove oldest 50% files</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.dangerButton]}
          onPress={clearAllCache}
          disabled={cacheInfo.isLoading}
        >
          <Text style={styles.buttonText}>Clear All Cache</Text>
          <Text style={styles.buttonSubtext}>Remove everything</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Cache Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>60 MB</Text>
            <Text style={styles.statLabel}>Limit</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>50%</Text>
            <Text style={styles.statLabel}>Cleanup</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {cacheInfo.size > 60 ? 'Exceeded' : 'OK'}
            </Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>
      </View>

      {/* Loading Overlay */}
      {cacheInfo.isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Processing Cache...</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  infoCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  limitInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  limitText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  button: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
});

export default CacheManagerUI;