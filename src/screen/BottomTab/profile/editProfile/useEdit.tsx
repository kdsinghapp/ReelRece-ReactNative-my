import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import ImagePicker from "react-native-image-crop-picker";

const useEdit = () => {
  const navigation = useNavigation();
  const [imageProfile, setImageProfile] = useState<object | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [editingValue, setEditingValue] = useState('');

  const pickImageFromGallery = useCallback(() => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: false,
      compressImageQuality: 0.4,
      mediaType: 'photo',
    })
      .then((image: object) => {
        setImageProfile(image);
        setIsModalVisible(false);
      })
      .catch((error) => {
        if (error.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Error', 'Failed to pick image from gallery');
        }
      });
  }, []);

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

  const takePhotoFromCamera = useCallback(async () => {
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
      setImageProfile(image);
      setIsModalVisible(false);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  }, []);
  return {
    navigation,
    takePhotoFromCamera,
    imageProfile, setImageProfile,
    isModalVisible, setIsModalVisible,
    pickImageFromGallery,
    modalVisible, setModalVisible,
    editingKey, setEditingKey,
    editingValue, setEditingValue,
  };

};

export default useEdit;
