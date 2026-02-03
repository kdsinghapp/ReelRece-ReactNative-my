import { Color } from '@theme/color';
import font from '@theme/font';
import { fileLogger } from '@utils/FileLogger';
import { t } from 'i18next';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl
} from 'react-native';
 const DebugLogsView: React.FC = () => {
  const [logs, setLogs] = useState<string>('Loading logs...');
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = async () => {
    try {
      const logContent = await fileLogger.readLogs();
      setLogs(logContent);
    } catch (error) {
      setLogs(`Error loading logs: ${error}`);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const clearLogs = async () => {
    await fileLogger.clearLogs();
    await loadLogs();
  };

  useEffect(() => {
    loadLogs();
    // Auto-refresh every 2 seconds
    const interval = setInterval(loadLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("common.debugLogs")}</Text>
        <TouchableOpacity onPress={clearLogs} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>{t("common.clear")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.logText}>{logs}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
         {t("common.logsPath")}:{fileLogger.getLogPath()}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.black,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Color.grey,
    borderBottomWidth: 1,
    borderBottomColor: Color.darkGrey,
  },
  title: {
    fontSize: 18,
    fontFamily: font.PoppinsBold,
    color: Color.whiteText,
  },
  clearButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: Color.primary,
    borderRadius: 5,
  },
  clearButtonText: {
    color: Color.whiteText,
    fontFamily: font.PoppinsMedium,
  },
  scrollView: {
    flex: 1,
    padding: 10,
  },
  logText: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: Color.lightGrayText,
    lineHeight: 16,
  },
  footer: {
    padding: 10,
    backgroundColor: Color.grey,
    borderTopWidth: 1,
    borderTopColor: Color.darkGrey,
  },
  footerText: {
    fontSize: 10,
    color: Color.placeHolder,
    fontFamily: font.PoppinsRegular,
  },
});

export default DebugLogsView;