import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import { RootState } from '@redux/store';
 import { updateUserData } from '@redux/feature/userSlice';
import { setUserProfile } from '@redux/feature/authSlice';
import { getUserProfile, uploadAvatarImage, ImagePickerResult } from '@redux/Api/authService';

const useProfile = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const userProfile = useSelector((state: RootState) => state.auth.userGetData);
 
  const [getAgain, setGetAgain] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  // Note: userProfileDate appears unused - keeping for backward compatibility
  const [userProfileDate, setUserProfileDate] = useState<Record<string, unknown>>({});

const fetchUserProfile = useCallback(async () => {
  if (!token) {
    setLoading(false);
    return;
  }
  
  try {
    setLoading(true);
     const res = await getUserProfile(token);
     dispatch(setUserProfile({ userGetData: res }));
  } catch (error) {
     // Set loading to false even on error to prevent infinite loading
    setLoading(false);
  } finally {
    setLoading(false);
  }
}, [token, dispatch]);


  // ✅ CRITICAL: Fetch profile whenever token changes (including after login)
  useEffect(() => {
    if (token) {
       fetchUserProfile();
    } else {
       setLoading(false);
    }
  }, [token]); // Only depend on token, not the function

  useEffect(() => {
    if (userProfile) {
       setLoading(false);
    }
  }, [userProfile]);

  const uploadProfileAvatar = useCallback(
    async (image: ImagePickerResult, resetImageCallback?: () => void) => {
      if (!image?.path || !token) return;

      setUploading(true);
      try {
        const response = await uploadAvatarImage(token, image);
        // if (!response || response?.status !== 200) {
        //   throw new Error("Upload failed at response level");
        // }

        // Alert.alert('Avatar uploaded successfully');
        const updatedProfile = await getUserProfile(token);
        dispatch(setUserProfile({ userGetData: updatedProfile }));
        setGetAgain(prev => prev + 1);
      } catch (error) {
         resetImageCallback?.();
        // Alert.alert('Failed to upload avatar');
      } finally {
        setUploading(false);
      }
    },
    [token, dispatch, setUserProfile]
  );

  return {
    loading,
    uploading,
    userProfile,
    userProfileDate,
    refetchUserProfile: fetchUserProfile,
    uploadProfileAvatar,
    setGetAgain,
    getAgain,
  };
};

export default useProfile;
