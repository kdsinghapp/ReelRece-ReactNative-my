import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Color } from '@theme/color';

const { width } = Dimensions.get('window');

interface ScoreIntroModalProps {
  visible: boolean;
  onClose: () => void;
  variant?: 'first' | 'second'; // Add this to control which version to show
}

const ScoreIntroModal = ({ visible, onClose, variant = 'first' }: ScoreIntroModalProps) => {
  const isFirstVariant = variant === 'first';

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[
              styles.tooltipContainer,
              isFirstVariant ? styles.leftStyle : styles.rightStyle
            ]}>
              <View style={[
                styles.triangle,
                isFirstVariant ? styles.leftTriangle : styles.rightTriangle
              ]} />

              <View style={styles.bubble}>
                <Text style={styles.title}>
                  {isFirstVariant ? 'Rec Score' : 'Friend Score'}
                </Text>
                <Text style={styles.description}>
                  {isFirstVariant 
                    ? "This score predicts how much you'll enjoy this movie/show, based on your ratings and our custom algorithm."
                    : "This score predicts how much your friends will enjoy this movie/show."}
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    // backgroundColor: Color.headerTransparent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    position: 'absolute',
    top: "55%",
    width: width * 0.92,
    marginBottom: 20,
  },
  leftStyle: {
    alignItems: 'flex-start',
  },
  rightStyle: {
    alignItems: 'flex-end',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Color.primary,
  },
  leftTriangle: {
    marginLeft: 20,
  },
  rightTriangle: {
    marginRight:100,
  },
  bubble: {
    // backgroundColor: '#2DB3F0',
    backgroundColor: Color.primary,
    borderRadius: 10,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    alignSelf: 'center',
    color: Color.whiteText,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  description: {
    alignSelf: 'center',
    color: Color.whiteText,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ScoreIntroModal;