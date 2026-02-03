import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Platform
} from 'react-native';
import { Color } from '@theme/color';
import { t } from 'i18next';

const LoadingModal = ({ visible }: { visible: boolean }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ActivityIndicator size="large" color={Color.primary} style={{marginTop:10}} />
          <Text  allowFontScaling={false}  style={styles.loadingText}>{t("common.wait")}</Text>
        </View>
      </View>
    </Modal>
  );
};
 
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',  // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    width: 200,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,  // For Android
  },
  loadingText: {
    marginTop: 15,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
});
 
export default LoadingModal;