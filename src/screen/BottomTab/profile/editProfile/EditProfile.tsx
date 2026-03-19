import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  ScrollView
} from 'react-native';
 import StatusBarCustom from '@components/common/statusBar/StatusBarCustom';
import styles from './style';
import useEdit from './useEdit';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { getUserProfile, updateUserProfile } from '@redux/Api/authService';
import { useRoute, RouteProp } from '@react-navigation/native';
 import LoadingModal from '@utils/Loader';
 import { updateUserProfileField } from '@redux/feature/authSlice';
import FastImage from 'react-native-fast-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { EditNameModal, HeaderCustom, ImagePickerModal } from '@components/index';
import imageIndex from '@assets/imageIndex';
import useProfile from '../profileScreen/useProfile';
import { BASE_IMAGE_URL } from '@config/api.config';
import { t } from 'i18next';


const EditProfile = () => {
  const isOnline = useNetworkStatus();
  const token = useSelector((state: RootState) => state.auth.token);
  const route = useRoute<RouteProp<{ params?: { avatar?: string } }, 'params'>>();
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
    const value = profileFields[key as keyof typeof profileFields] ?? '';
    setEditingKey(key);
    setEditingValue(value);
    setModalVisible(true);
  }, [profileFields.name, profileFields.username, profileFields.pronouns, profileFields.bio]);

  const fieldLabel = useMemo(
    () => (editingKey ? editingKey.charAt(0).toUpperCase() + editingKey.slice(1) : ''),
    [editingKey]
  );

  const handleCloseEditModal = useCallback(() => setModalVisible(false), []);

  const handleSaveProfileField = useCallback(
    async (key: string, newValue: string) => {
      if (!token) return;
      try {
        setProfileFields((prev) => ({ ...prev, [key]: newValue }));
        await updateUserProfile(token, { [key]: newValue });
        dispatch(updateUserProfileField({ key: key as 'name' | 'username' | 'pronouns' | 'bio', value: newValue }));
        await getUserProfile(token);
      } catch (error) {
        // handle error if needed
      }
    },
    [token, dispatch]
  );

  const handleCloseImagePicker = useCallback(() => setIsModalVisible(false), []);

  const imagePath = (imagePrfile as { path?: string } | null)?.path;

  useEffect(() => {
    if (imagePath) {
      uploadProfileAvatar(imagePrfile as { path: string }, () => setImagePrfile(null));
    }
  }, [imagePrfile]);

  const avatarUri = imagePath
    ? imagePath
    : userProfile?.avatar
      ? `${BASE_IMAGE_URL}${userProfile.avatar}`
      : undefined;

  const avatarSource = useMemo(
    () =>
      avatarUri
        ? {
            uri: avatarUri,
            priority: FastImage.priority.low,
            cache: FastImage.cacheControl.immutable,
          }
        : imageIndex.UserProfile,
    [avatarUri]
  );

  const scrollContentStyle = useMemo(() => ({ paddingBottom: 24 }), []);
  const viewContainerStyle = useMemo(() => [styles.container, { padding: 20 }], []);

  const handleOpenImagePicker = useCallback(() => setIsModalVisible(true), []);

  return (
    <SafeAreaView edges={isOnline ? ['top'] : []} style={styles.container}>
      <StatusBarCustom />
      <HeaderCustom title= {t("home.editprofile")}   backIcon={imageIndex.backArrow} />
      <View style={viewContainerStyle}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={scrollContentStyle}
          keyboardShouldPersistTaps="handled"
        >
          <FastImage
            style={styles.avatar}
            source={avatarSource}
            resizeMode={FastImage.resizeMode.cover}
          />

          <TouchableOpacity style={styles.button} onPress={handleOpenImagePicker}>
            <Text style={styles.buttonText}>{t("home.changepicture")}</Text>
          </TouchableOpacity>
          {profileData.map((item) => (
            <View key={item.key} style={styles.fieldRow}>
              <Text style={styles.label}>{item.label}</Text>
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldText} numberOfLines={1}>
                  {item?.value?.trim() ? item.value : `Add ${item.label.toLowerCase()}`}
                </Text>
                <TouchableOpacity onPress={() => handleEdit(item.key)}>
                  <Image source={imageIndex.edit} style={styles.editIcon} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
        <ImagePickerModal
          modalVisible={isModalVisible}
          pickImageFromGallery={pickImageFromGallery}
          takePhotoFromCamera={takePhotoFromCamera}
          setModalVisible={handleCloseImagePicker}
          onClose={handleCloseImagePicker}
        />
        <EditNameModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          onClose={handleCloseEditModal}
          fieldLabel={fieldLabel}
          fieldKey={editingKey ?? ''}
          initialValue={editingValue ?? ''}
          onSave={handleSaveProfileField}
          token={token ?? ''}
        />
      </View>
      {uploading && <LoadingModal visible={uploading} />}
    </SafeAreaView>
  );
};
export default React.memo(EditProfile);
