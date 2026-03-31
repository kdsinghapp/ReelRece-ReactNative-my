import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import ScreenNameEnum from '@routes/screenName.enum';
import { useNavigation } from '@react-navigation/native';
import CreateGroupName from '@components/modal/GroupMemberModal/CreateGroupName';
import SelectFriendCom from '@components/common/SelectFriendCom/SelectFriendCom';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { createGroup, getAllGroups, getGroupActivities, getGroupMembers } from '@redux/Api/GroupApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import useSignup from '@screens/Auth/signup/useSignup';
import { CustomStatusBar, HeaderCustom, SuccessMessageCustom } from '@components/index';
import { t } from 'i18next';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
const CreateGroupScreen = () => {
  const { setToastMess, toastMess } = useSignup();
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUser = useSelector((state: RootState) => state.auth.userGetData);
  const navigation = useNavigation();
  const [loader, setLoader] = useState(false);
  const [groupNameState, setGroupNameState] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastMessColorGreen, setToastMessColorGreen] = useState(true);
  const [groupsData, setGroupsData] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true); // optional
  const [group_Id, setGroup_Id] = useState(null); // optional
  const [group_api_create, setGroup_api_create] = useState(false); // optional
  const [existingGroupNames, setExistingGroupNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchExistingGroups = async () => {
      try {
        if (!token) return;
        const response = await getAllGroups(token);
        const results = Array.isArray(response?.results) ? response.results : Array.isArray(response) ? response : [];
        if (results.length > 0) {
          const names = results
            .map((g: any) => g.name || g.group_name || g.groupName || g.username)
            .filter((name: any): name is string => typeof name === 'string' && name.trim().length > 0);
          setExistingGroupNames(names);
        }
      } catch (error) { 
      }
    };
    fetchExistingGroups();
  }, [token]);

  const showToast = (message: string, isSuccess: boolean = true) => {
    setToastMessage(message);
    setToastMessColorGreen(isSuccess);
    setToastMess(true);
    setTimeout(() => {
      setToastMess(false);
    }, 2000);
  };

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const getMemberName = (member: any) =>
    (member?.name || member?.username || member?.id || '').trim();

  const generateDefaultGroupName = (members: any[]) => {
    const creatorName = currentUser?.name || currentUser?.username || "You";
    const otherNames = members.map(getMemberName).filter(Boolean);

    if (otherNames.length === 0) return '';

    const allNames = [creatorName, ...otherNames];

    if (allNames.length === 2) {
      return `${allNames[0]} & ${allNames[1]}`;
    }

    // 3 or more members
    return `${allNames.slice(0, -1).join(', ')} & ${allNames[allNames.length - 1]}`;
  };

  const handleCreateGroup = async () => {
    if (!selectedMembers || selectedMembers.length === 0) {
      showToast("Please select at least one friend.", false);
      return;
    }
    const finalGroupName = groupNameState?.trim() || generateDefaultGroupName(selectedMembers);

    setLoader(true)
    try {
      // ✅ Safe array mapping with guards
      const memberUsernames = Array.isArray(selectedMembers)
        ? selectedMembers.map(member => member?.username || member?.id || member?.name).filter(Boolean)
        : []; // ✅ FIXED
      // const memberUsernames = selectedMembers.map(member => member.id);
      const response = await createGroup(token || '', finalGroupName, memberUsernames);
      const data = response?.data as { message?: string; messaged?: string } | undefined;
      const createdGroupId = (data?.message ?? data?.messaged)?.split(' ')[0]?.trim();
      setGroup_Id(createdGroupId);
      setGroup_api_create(true);
      setLoader(false)
      showToast("Group created successfully!", true);
      setTimeout(() => {
        navigation.goBack();
      }, 300);
    } catch (error: any) {
      setLoader(false)


      if (error.response && error.response.status === 409) {
        setLoader(false)
        const existingGroupName = error.response.data.existing_group_name;
        const message = existingGroupName
          ? `Group already exists: '${existingGroupName}'. Check your pending invites to accept the group invitation.`
          : "Group already exists. Check your pending invites to accept the group invitation.";
        showToast(message, false);
      } else {
        setLoader(false)

        showToast("Group creation failed. Please try again.", false);
      }
    }
  }


  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!group_api_create || !group_Id) return;

      try {
        setLoadingGroups(true);

        const groupName = groupNameState;
        const groupId = group_Id;
        // ✅ Fetch activities
        let activities = {
          current_page: 1,
          results: [],
          total_pages: 1,
        };
        try {
          const activityData = await getGroupActivities(token, groupId);
          activities = {
            current_page: activityData?.current_page || 2,
            results: activityData?.results || [],
            total_pages: activityData?.total_pages,
          };
        } catch (err) {
        }

        // ✅ Fetch members
        let members = [];
        try {
          const memberData = await getGroupMembers(token || '', groupId || '');
          members = (memberData as any)?.members || (memberData as any)?.results || [];
        } catch (err) {
        }
        const finalGroup = {
          groupId,
          groupName,
          isMuted: false,
          members,
          activities,
        };

        setGroupsData([finalGroup]);
 
        setTimeout(() => {
          navigation.navigate(ScreenNameEnum.WatchWithFriend as never, {
            groupProps: finalGroup,
            groupId: groupId, 
          });
        }, 1000);
      } catch (err) {
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroupDetails();
  }, [group_api_create, group_Id]);
 
  const renderContent = () => (
    <View style={{ justifyContent: 'space-between', flex: 1, }}>

      <SelectFriendCom
        setSearchFocused={setSearchFocused}
        onSelectionChange={setSelectedMembers}
        token={token}
        type="createGroup"
      />
      {!(isSearchFocused && isKeyboardVisible) && (
        <CreateGroupName
          groupName={groupNameState}
          setGroupName={setGroupNameState}
          onClose={() => navigation.goBack()}
          onCreate={handleCreateGroup}
          showToast={showToast}
          toastMess={toastMess}
          selectedMembers={selectedMembers}
          existingGroupNames={existingGroupNames}
        />
      )}
    </View>
  );
  const isOnline = useNetworkStatus();
  return (
    <SafeAreaView edges={isOnline ? ['top'] : []} style={styles.container}>
      <CustomStatusBar />
      <View style={{ paddingTop: 18, }} >
        <HeaderCustom
          // 
          title={(t("discover.addfriend"))}
          backIcon={imageIndex.backArrow}
          rightIcon={false}
          onRightPress={() => navigation.navigate(ScreenNameEnum.OtherWatchingProfile)}
        />
      </View>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
      >
        {renderContent()}
      </KeyboardAvoidingView>
      {toastMess && (
        <SuccessMessageCustom
          textColor={Color.whiteText}
          color={toastMessColorGreen ? Color.green : Color.red}
          message={toastMessage}
        />
      )}

    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
  },
  keyboardAvoid: {
    flex: 1,
  },

});
export default React.memo(CreateGroupScreen);
