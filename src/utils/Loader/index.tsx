import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';

const LoadingModal = ({ visible }: { visible: boolean }) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={Color.primary} />
          <Text style={styles.text}>Please wait...</Text>
        </View>
      </View>
    </Modal>
  );
};

export default LoadingModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 180,
    paddingVertical: 25,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  text: {
    marginTop: 15,
    fontSize: 15,
    color: '#555',
    fontFamily:font.PoppinsRegular
   },
});
