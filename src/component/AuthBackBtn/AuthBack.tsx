import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import imageIndex from '@assets/imageIndex';

const AuthBack = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={{ marginTop: 70, marginLeft: 16 }} onPress={() => navigation.goBack()} >
      <Image style={{ height: 24, width: 24, resizeMode: 'contain' }} source={imageIndex.backArrow} />
    </TouchableOpacity>
  )
}

export default AuthBack

const styles = StyleSheet.create({})