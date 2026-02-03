
import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, Dimensions, TouchableWithoutFeedback, ImageComponent, Image } from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import font from '@theme/font';

const { width, height } = Dimensions.get('window');

const SlideInTooltipModal = ({
  visible,
  onClose,
  tooltipText = "Use this button to rank movies, TV shows",
  buttonText = "Got it!",
  flatlistTop,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current; // slide from left
  const fadeAnim = useRef(new Animated.Value(0)).current; // fade in

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel

        ([
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const handleToolipSaveAsync = async () => {
   onClose();
    // Save the tooltip status to AsyncStorage
    await AsyncStorage.setItem("tooltipShown", "flase");
  }

  return (
    <View style={styles.modalOverlay}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backgroundOverlay} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.container, {
        transform: [{ translateX: slideAnim }],
        opacity: fadeAnim,
        top : 100 + flatlistTop,
      }]}>
        <TouchableOpacity style={{
          backgroundColor: Color.modalTransperant, 
          justifyContent:'center',
          paddingLeft:5,
          // alignItems;'center',
          right: -155,
          // left:22,
          width: 50,
          height: 50,
          borderRadius:6,
        
        }} >
          <Image style={styles.animatedImage} source={imageIndex.mdRankings} />

        </TouchableOpacity>
        <View style={styles.arrow} />

        <View style={styles.tooltip}>
          <Text style={styles.text}>{tooltipText}</Text>
          <TouchableOpacity style={styles.button} onPress={()=> handleToolipSaveAsync()}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default SlideInTooltipModal;
const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: height,
    width: width,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // slightly dimmed background
  },
  container: {
    position: 'absolute',
    // top: "24%",
    // top:201,
    right: 22,
    // left: 45,
  },
  tooltip: {
    backgroundColor: Color.primary,
    padding: 16,
    borderRadius: 8,
    width: 220,
    // shadowColor: Color.background,
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 4,
    elevation: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  animatedImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  text: {
    color: Color.whiteText,
    marginBottom: 12,
    fontSize: 16,
fontFamily:font.PoppinsRegular,

    lineHeight: 18,
    textAlign: "center"
  },
  button: {
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 30,
    alignSelf: 'center',
    borderColor: Color.whiteText,
    borderWidth: 1
  },
  buttonText: {
    color: Color.whiteText,
fontFamily:font.PoppinsMedium,
    fontSize: 16,
    lineHeight:20,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#008AC9',
    alignSelf: 'center',
    marginBottom: -2,
    marginTop:-12,
    marginLeft: 130,
  },
});
