import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import ImagePicker from "react-native-image-crop-picker";

const useEdit = () => {
  const navigation = useNavigation();
  const [imagePrfile, setImagePrfile] = useState<object | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [editingValue, setEditingValue] = useState('');

  const pickImageFromGallery = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: false,
      compressImageQuality: 0.4,
      mediaType: 'photo',
      // compressImageQuality: 0.2,


    })
      .then((image: object) => {
        setImagePrfile(image)
        setIsModalVisible(false);
      })
      .catch((error) => {
        
      });
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'We need access to your camera to take your profile photo.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
          buttonNeutral: 'Ask Me Later',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      return false;
    }
  };

  const takePhotoFromCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission required', 'Camera permission is needed to take a photo.');
      return;
    }
    try {
      const image: object = await ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: false,
        compressImageQuality: 0.4,
        mediaType: 'photo',
      });
      setImagePrfile(image);
      setIsModalVisible(false);
    } catch (error: any) {
      // user cancelled or error; optionally handle
    }
  };
  return {
    navigation,
    takePhotoFromCamera,
    imagePrfile, setImagePrfile,
    isModalVisible, setIsModalVisible,
    pickImageFromGallery,
    modalVisible, setModalVisible,
    editingKey, setEditingKey,
    editingValue, setEditingValue,
  };

};

export default useEdit;
