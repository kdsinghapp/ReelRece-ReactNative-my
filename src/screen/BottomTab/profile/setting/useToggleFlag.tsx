import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
 import { updateProfileFlags } from '@redux/Api/authService';
import { RootState } from '@redux/store';
import useProfile from '../profileScreen/useProfile';
type FlagKey =
  | "autoplay_trailer"
  | "videos_start_with_sound"
  | "is_private"
  | "group_add_approval_required"
  | "opt_out_third_party_data_sharing";

const useToggleFlag = (flagKey: FlagKey) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const userProfile = useSelector((state: RootState) => state.auth.userGetData);
  const { refetchUserProfile } = useProfile();

  const [flagValue, setFlagValue] = useState<boolean>(false);
  //  Set initial value when userProfile changes
  useEffect(() => {
    if (userProfile && userProfile.hasOwnProperty(flagKey)) {
      setFlagValue(userProfile?.[flagKey] ?? false);
    }
  }, [userProfile, flagKey]);

  //  Update toggle and send to backend
  const handleToggle = async (val: boolean) => {
    setFlagValue(val);
    try {
      await updateProfileFlags(token, {
        [flagKey]: val ? "yes" : "no",
      });
      await refetchUserProfile();
    } catch (err) {
     }
  };

  return {
    flagValue,
    handleToggle,
  };
};

export default useToggleFlag;