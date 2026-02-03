import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Color } from '@theme/color';

const CustomSwitch = ({ value, onValueChange }) => {
  const [anim] = useState(new Animated.Value(value ? 1 : 0));

  // ✅ Sync animation whenever `value` changes from outside (like redux or parent)
  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const toggleSwitch = () => {
    onValueChange(!value); // This should trigger parent update
  };

  const thumbPosition = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 17],
  });

  return (
    <TouchableOpacity onPress={toggleSwitch} activeOpacity={1}>
      <View style={[styles.track, { backgroundColor: value ? "#004565" : "#2a2a2b" }]}>
        <Animated.View
          style={[
            styles.thumb,
            {
              left: thumbPosition,
              backgroundColor: value ? '#008AC9' : '#f4f3f4',
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 36,
    height: 16,
    borderRadius: 10,
    backgroundColor: Color.textGray,
    justifyContent: 'center',
    padding: 2,
  },
  thumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1.5,
    elevation: 2,
  },
});

export default CustomSwitch;
