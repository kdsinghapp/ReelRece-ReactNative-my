import React from 'react';
import { View, Modal,Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Color } from '@theme/color';
 
interface CustomModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onWatch: () => void;
  source: { uri: string } | number; // Can be remote URI or local require()
}

const WatchModal: React.FC<CustomModalProps> = ({source, isVisible, onCancel, onWatch }) => {
  return (
    // <Modal visible={isVisible} transparent animationType="fade"   onRequestClose={onClose} >
    <Modal visible={isVisible} transparent animationType="fade"   onRequestClose={onCancel} >
    <View style={styles.centeredView}>
      <View style={styles.modalContainer}>
        <Image source={source} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Watch on Netflix app</Text>
  
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.watchButton} onPress={onWatch}>
            <Text style={styles.watchText}>Watch</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
  
  );
};

export default WatchModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', // Optional for dimming background
   },
  
  modalContainer: {
    backgroundColor: Color.modalBg,
    borderRadius: 16,
    padding: 6,
    alignItems: 'center',
    marginHorizontal:20
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 15,
    marginTop:11
  },
  title: {
    fontSize: 20,
    color:  Color.whiteText,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop:15
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color:Color.whiteText,
    fontSize: 16,
    fontWeight:"500"
  },
  watchButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  watchText: {
    color: 'rgba(0, 138, 201, 1)',
     fontSize: 16,
    fontWeight:"500"
  },
});


