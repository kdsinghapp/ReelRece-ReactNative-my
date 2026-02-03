
import { Color } from '@theme/color';
import { t } from 'i18next';
import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Linking, Platform, Image } from 'react-native';

type Props = {
  isConnected?: boolean | null; // Change to optional
  modalVisible: boolean;
  onlineText?: string;
  offlineText?: string;
  checkingText?: string;
};


const NetworkStatusModal: React.FC<Props> = ({
  isConnected,
  modalVisible,
  onlineText,
  offlineText,
  checkingText,
}) => {
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('App-Prefs:root=MOBILE_DATA_SETTINGS_ID');
      //     Linking.openURL('App-Prefs:root=WIFI');

    } else {
      Linking.openSettings();
    }
  };



  const getStatusText = () => {
    if (isConnected === null) return checkingText || 'Checking connection...';
    return isConnected ? onlineText || 'You are Online' : offlineText || 'No Internet Connection';
  };

  return (
    <Modal visible={modalVisible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text allowFontScaling={false} style={styles.text}>
            {getStatusText()}
          </Text>
          {!isConnected && (
            <TouchableOpacity style={styles.button} onPress={openSettings}>
              <Text allowFontScaling={false} style={styles.buttonText}>

                {t("common.goSettings")}

              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Slightly darker for better contrast
  },
  modalContent: {
    width: '85%',
    padding: 25,
    backgroundColor: Color.whiteText,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  statusIcon: {
    width: 60,
    height: 60,
    marginBottom: 15,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20
  },
  button: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: 'black', // Friendly green button
    borderRadius: 15,
  },
  buttonText: {
    fontSize: 16,
    color: Color.whiteText,
    fontWeight: '600',
  },
});

export default NetworkStatusModal;
