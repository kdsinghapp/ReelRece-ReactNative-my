import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, SafeAreaView } from 'react-native';

class PopupLoggerClass {
  private static instance: PopupLoggerClass;
  private logs: string[] = [];
  private updateCallback: ((logs: string[]) => void) | null = null;

  static getInstance() {
    if (!PopupLoggerClass.instance) {
      PopupLoggerClass.instance = new PopupLoggerClass();
    }
    return PopupLoggerClass.instance;
  }

  log(...args: []) {
    const message = args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');

    const timestamp = new Date().toLocaleTimeString();
    this.logs.push(`[${timestamp}] ${message}`);

    // Keep only last 50 logs
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(-50);
    }

    if (this.updateCallback) {
      this.updateCallback([...this.logs]);
    }
  }

  clear() {
    this.logs = [];
    if (this.updateCallback) {
      this.updateCallback([]);
    }
  }

  setUpdateCallback(callback: (logs: string[]) => void) {
    this.updateCallback = callback;
    callback([...this.logs]);
  }

  getLogs() {
    return [...this.logs];
  }
}

export const popupLogger = PopupLoggerClass.getInstance();

export const PopupLoggerComponent: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    popupLogger.setUpdateCallback(setLogs);
  }, []);

  if (logs.length === 0) return null;

  return (
    <>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.buttonText}>Logs ({logs.length})</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Debug Logs</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => popupLogger.clear()}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={styles.logContainer}>
              {logs.map((log, index) => (
                <Text key={index} style={styles.logText}>{log}</Text>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 25,
    zIndex: 9999,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  clearButton: {
    backgroundColor: '#ff9800',
    padding: 8,
    borderRadius: 5,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logContainer: {
    flex: 1,
    padding: 10,
  },
  logText: {
    fontSize: 11,
    marginBottom: 5,
    fontFamily: 'Courier',
    color: '#333',
  },
});