import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
 import { RootState } from '@redux/store';
 import { setUserProfile } from '@redux/feature/authSlice';
import { getUserProfile, ImagePickerResult } from '@redux/Api/authService';

const useProfile = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const userProfile = useSelector((state: RootState) => state.auth.userGetData);
   const [getAgain, setGetAgain] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);

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
    setLoading(false);
  } finally {
    setLoading(false);
  }
}, [token, dispatch]);

  useEffect(() => {
    if (token) {
       fetchUserProfile();
    } else {
       setLoading(false);
    }
  }, [token]); 

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
        const updatedProfile = await getUserProfile(token);
        dispatch(setUserProfile({ userGetData: updatedProfile }));
        setGetAgain(prev => prev + 1);
      } catch (error) {
         resetImageCallback?.();
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
