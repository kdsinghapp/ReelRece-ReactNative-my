import Logger from '@utils/Logger';
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView
} from 'react-native';
 
const LogViewer = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const [logs, setLogs] = useState<(string | boolean)[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (visible) {
      // Update logs when modal becomes visible
      const currentLogs = Logger.getLogs();
      setLogs([...currentLogs].reverse()); // Show newest first
    }
  }, [visible, refreshKey]);

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error': return '#ff4444';
      case 'warn': return '#ffaa00';
      case 'info': return '#00aaff';
      case 'debug': return '#aa00ff';
      default: return '#ffffff';
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const clearLogs = () => {
    Logger.clearLogs();
    setLogs([]);
  };

  const refreshLogs = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Debug Logs</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={refreshLogs} style={styles.button}>
              <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearLogs} style={styles.button}>
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.logContainer}>
          {logs.length === 0 ? (
            <Text style={styles.noLogs}>No logs yet</Text>
          ) : (
            logs.map((log, index) => (
              <View key={index} style={styles.logEntry}>
                <View style={styles.logHeader}>
                  <Text style={[styles.logLevel, { color: getLogColor(log.level) }]}>
                    {log.level.toUpperCase()}
                  </Text>
                  <Text style={styles.logTime}>
                    {formatTimestamp(log.timestamp)}
                  </Text>
                </View>
                <Text style={styles.logMessage}>{log.message}</Text>
                {log.data && (
                  <Text style={styles.logData}>
                    {JSON.stringify(log.data, null, 2)}
                  </Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  logContainer: {
    flex: 1,
    padding: 8,
  },
  noLogs: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  logEntry: {
    marginBottom: 12,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#333',
    backgroundColor: '#111',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logLevel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logTime: {
    fontSize: 10,
    color: '#888',
  },
  logMessage: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 4,
  },
  logData: {
    color: '#aaa',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 4,
  },
});

export default LogViewer;