import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, 
  FlatList, Alert
} from 'react-native';
 import StatusBarCustom from '@components/common/statusBar/StatusBarCustom';
import styles from './style';
import useEdit from './useEdit';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { getUserProfile, updateUserProfile } from '@redux/Api/authService';
import { useRoute } from '@react-navigation/native';
 import LoadingModal from '@utils/Loader';
 import { updateUserProfileField } from '@redux/feature/authSlice';
import FastImage from 'react-native-fast-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EditNameModal, HeaderCustom, ImagePickerModal } from '@components/index';
import imageIndex from '@assets/imageIndex';
import useProfile from '../profileScreen/useProfile';
import { BASE_IMAGE_URL } from '@config/api.config';
import { t } from 'i18next';


const EditProfile = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const route = useRoute();
  const { avatar } = route?.params || {};

  const {
    navigation,
    takePhotoFromCamera,
    imagePrfile, setImagePrfile,
    isModalVisible, setIsModalVisible,
    modalVisible, setModalVisible,
    editingKey, setEditingKey,
    editingValue, setEditingValue,
    pickImageFromGallery
  } = useEdit();

  const {
    userProfile,
    refetchUserProfile,
    loading,
    uploading,
    uploadProfileAvatar
  } = useProfile();

  const [profileFields, setProfileFields] = useState({
    name: '',
    username: '',
    pronouns: '',
    bio: ''
  });
const dispatch = useDispatch();
const profileData = useMemo(() => [
  { key: 'name', label: 'Name', value: profileFields.name },
  { key: 'username', label: 'Username', value: profileFields.username },
  { key: 'pronouns', label: 'Pronouns', value: profileFields.pronouns },
  { key: 'bio', label: 'Bio', value: profileFields.bio },
], [profileFields]);


  useEffect(() => {
    const getuserProfile = async () => {
      if (!token) return;
      try {
        const userData = await getUserProfile(token);
         setProfileFields({
          name: userData.name || '',
          username: userData.username || '',
          pronouns: userData.pronouns || '',
          bio: userData.bio || '',
        });
      } catch (error) {}
    };
    getuserProfile();
  }, [token]);

  const handleEdit = useCallback((key: string) => {
    const selectedItem = profileData.find(item => item.key === key);
    if (selectedItem) {
      setEditingKey(selectedItem.key);
      setEditingValue(selectedItem.value);
      setModalVisible(true);
    }
  }, [profileData]);

  useEffect(() => {
    if (imagePrfile?.path) {
      uploadProfileAvatar(imagePrfile, () => setImagePrfile(null));
    }
  }, [imagePrfile]);

const avatarUri = imagePrfile?.path
  ? imagePrfile.path
  : `${BASE_IMAGE_URL}${userProfile?.avatar}` + `?nocache=${new Date().getTime()}`;

  const renderItem = useCallback(({ item }) => (
    <View style={styles.fieldRow}>
      <Text style={styles.label}>{item.label}</Text>
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldText}>{item?.value}</Text>
        <TouchableOpacity onPress={() => handleEdit(item.key)}>
          <Image source={imageIndex.edit} style={styles.editIcon} />
        </TouchableOpacity>
      </View>
    </View>
  ), [handleEdit]);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBarCustom />
      <HeaderCustom title= {t("home.editprofile")}   backIcon={imageIndex.backArrow} />
      <View style={[styles.container, { padding: 20,  }]}>
       {/* <Image source={{ uri: avatarUri }} style={styles.avatar} /> */}

 <FastImage
            style={styles.avatar}
            source={{
               uri: avatarUri,
              priority: FastImage.priority.low,
              cache: FastImage.cacheControl.immutable,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />

        <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.buttonText}>{t("home.changepicture")}</Text>
        </TouchableOpacity>
        <FlatList
          data={profileData}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
             removeClippedSubviews
  initialNumToRender={4}
  windowSize={5}
  maxToRenderPerBatch={4}
        />
        <ImagePickerModal
          modalVisible={isModalVisible}
          pickImageFromGallery={pickImageFromGallery}
          takePhotoFromCamera={takePhotoFromCamera}
          setModalVisible={() => setIsModalVisible(false)}
          onClose={() => setIsModalVisible(false)}
          
        />
        <EditNameModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          onClose={() => setModalVisible(false)}
          fieldLabel={editingKey.charAt(0).toUpperCase() + editingKey.slice(1)}
          fieldKey={editingKey}
          initialValue={editingValue}
          onSave={async (key, newValue) => {
            try {
              setProfileFields((prev) => ({ ...prev, [key]: newValue }));
              // if (!token) return {
              // Alert.alert('Token missing');
              // }
              await updateUserProfile(token, { [key]: newValue });
              dispatch(updateUserProfileField({ key: 'avatar', value: 'new-avatar.png' }));
              await getUserProfile(token)
            } catch (error) {
             }
          }}
          

        />
      </View>
      {uploading && <LoadingModal isVisible={uploading} />}
    </SafeAreaView>
  );
};
export default React.memo(EditProfile);
