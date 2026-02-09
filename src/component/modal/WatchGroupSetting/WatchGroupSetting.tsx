import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  Dimensions,
  Pressable,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import font from '@theme/font';
import ScreenNameEnum from '@routes/screenName.enum';
import { useNavigation } from '@react-navigation/native';
import { getAllGroups, getGroupMembers, leaveGroup, renameGroup, toggleGroupNotification } from '@redux/Api/GroupApi';
import GroupMembersModal from '@components/modal/GroupMemberModal/GroupMemberModal';
import AddFrindModal from '@components/modal/AddFrindModal/AddFrindModal';
import LogoutModal from '@components/modal/logoutModal/logoutModal';
import GroupAllAvatars from '@components/common/GroupAllAvatars/GroupAllAvatars';
import StatusBarCustom from '@components/common/statusBar/StatusBarCustom';
import SuccessMessageCustom from '@components/common/successMessage/SuccessMessageCustom';
import EditNameModal from '@components/modal/editNameModal/EditNameModal';
import CustomSwitch from '@components/common/CustomSwitch/CustomSwitch';
import { t } from 'i18next';

const { width, height } = Dimensions.get('window');

const GroupSettingModal = ({ visible, onClose, group, groupId, token, group_name, setGroup_name }) => {
  const navigation = useNavigation();
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [isTrailer, setIsTrailer] = useState(false);
  const [editNameModal, setEditNameModal] = useState(false);
  const [groupMember, setGroupMember] = useState(false);
  const [addFrindModal, setAddFrindModal] = useState(false);
  const [groupName, setgroupName] = useState("Movie Night Crew")
  const [exitGroupModal, setExitGroupModal] = useState(false);
  const [deletegroupModal, setDeletegroupModal] = useState(false)
  // const [ countmemebers , setCountmemebers ] = useState('')

  // const userCount = group?.members.length;
  const [isGroupMute, setIsGroupMute] = useState(group?.isMuted);


  const [toestMess, setToestMess] = useState(false)
  const [toestMessColorGreen, setToestMessGreen] = useState(true)
  const [toastMessage, setToastMessage] = useState('');


  const toggleNotification = () => {
    setNotificationEnabled(prev => !prev);
  };

  // const renameGroupHandle = async (token, groupId, groupName) => {
  //   try {
  //     const response = await renameGroup(token, groupId, groupName);
  //   } catch (error) {
  //   }
  // }

  const handleNotification = async (token, groupId, currentStatus) => {
    const newStatus = currentStatus ? 'off' : 'on'; // true => 'off', false => 'on'
    try {
      setIsGroupMute(!isGroupMute)
      const response = await toggleGroupNotification(token, groupId, newStatus);

    } catch (error) {
    }
  };
  useEffect(() => {
    fetchGroups()
  }, [])
  const [group1, setGroup] = useState([]);
  const fetchGroups = async () => {
    try {
      const groupsRes = await getGroupMembers(token, groupId);
      setGroup(groupsRes);
    } catch (error) {
    }
  };



  const handleLogOutMsg = () => {
    setToestMess(true)
  }

  const hanldeleaveGroup = async (token, groupId) => {
    try {
      const response = await leaveGroup(token, groupId)
      onClose()
      navigation.navigate(ScreenNameEnum.WatchScreen, {
        getAllGroupReferace: Date.now()
      })


    } catch (error) {
    }
  };

  const [userCount, setUserCount] = useState(group1?.results?.length || group);
  const [userCount1, setUserCount1] = useState(0);
  useEffect(() => {
    if (group1?.results?.length !== undefined) {
      setUserCount1(group1.results.length);


    }
  }, [group1?.results?.length || group]);

  useEffect(() => {
    fetchGroups();
  }, [groupMember, addFrindModal]);

  const formatGroupName = (name?: string) => {
    if (!name) return '';

    return name
      .replace(/\bnull\b/gi, '')        // remove "null"
      .replace(/\s+/g, ' ')             // extra spaces remove
      .trim()
      // 🔥 agar last name comma ke bina hai → usse ", lastName" bana do
      .replace(/ ([^,]+)$/g, ', $1')
      .split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0)
      .join(', ');
  };


  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: Color.modalTransperant }}  >

        <StatusBarCustom
          barStyle="light-content"
          backgroundColor={Color.modalTransperant}
          translucent={false}
        />
        {/* <StatusBar translucent backgroundColor="transparent" barStyle="light-content" /> */}

        {/* <BlurViewCom /> */}
        <View style={[styles.modalContainer, {
          marginTop: Platform.OS === "ios" ? 30 : 0,
        }]}>
          <View style={styles.headerContainer} >
            <TouchableOpacity onPress={() => {
              onClose(userCount)
            }} >
              <Image source={imageIndex.backArrow} style={styles.icon} resizeMode="contain" />

            </TouchableOpacity>
            <Text style={styles.title} >

              {t("common.groupSetting")}
            </Text>
          </View>

          <View style={styles.headerSection}>
            <View style={styles.avatarsContainer}>
              <GroupAllAvatars group={group1?.results} />
            </View>
            <View style={styles.groupNameRow}  >
              <Image source={imageIndex.edit} style={{ height: 24, width: 24, tintColor: Color.background, }} resizeMode='contain' />

              {/* <Text style={styles.groupName} numberOfLines={2} >{formatGroupName(group_name)}</Text> */}
              <Text style={styles.groupName} numberOfLines={2} >{group_name}</Text>

              <TouchableOpacity onPress={() => setEditNameModal(true)} >
                <Image source={imageIndex.edit} style={{ height: 24, width: 24, tintColor: Color.primary, marginLeft: 5, }} resizeMode='contain' />
              </TouchableOpacity  >
            </View>
          </View>


          {/* Options List */}
          <TouchableOpacity style={styles.optionRow} onPress={() => setGroupMember(true)} >
            <Image source={imageIndex.usersGroup} style={{ marginLeft: 6, height: 24, width: 24 }} resizeMode='contain' />

            {/* <Feather name="users" size={20} color="#fff" /> */}
            {/* <Text style={styles.optionText}>Members {`(${userCount1})`} </Text> */}
            <Text style={styles.optionText}>
              {t("common.members")}{`(${group1?.results?.length || 0})`}
            </Text>

          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow} onPress={() => setAddFrindModal(true)} >
            <Image source={imageIndex.UserAdd} style={{ marginLeft: 6, height: 24, width: 24 }} resizeMode='contain' />

            {/* <Feather name="user-plus" size={20} color="#fff" /> */}
            <Text style={styles.optionText}>{t("common.addFriends")}</Text>
          </TouchableOpacity>

          <View style={[styles.optionRow, { justifyContent: 'space-between', }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={imageIndex.bellNotification}
                style={{
                  marginLeft: 6, height: 24, width: 24,

                }}
                resizeMode="contain"
              />
              <Text style={styles.optionText}> {t("common.notification")}
              </Text>
            </View>

            <CustomSwitch
              value={!isGroupMute}
              onValueChange={() => handleNotification(token, groupId, isGroupMute)}
            />
          </View>
          <TouchableOpacity style={styles.optionRow} onPress={() => setExitGroupModal(true)} >
            {/* <Feather name="log-out" size={20} color="#fff" /> */}
            <Image source={imageIndex.settingExit} style={{ marginLeft: 6, height: 24, width: 24 }} resizeMode='contain' />

            <Text style={styles.optionText}>{t("common.exitGroup")}</Text>
          </TouchableOpacity>
        </View>

        <EditNameModal
          modalVisible={editNameModal}
          fieldLabel= {t("common.changeGroup")} 
          initialValue={group_name}
          setGroup_name={setGroup_name}
          setModalVisible={setEditNameModal}
          fieldKey="group_name"
          group_name={group_name}
          groupId={groupId}
          token={token}
          type="group_name"
          onSave={(key, newValue) => {
            setgroupName(newValue); //  Local UI update
          }}
          onClose={() => setEditNameModal(false)}
        />

        {/* <GroupMembersModal visible={groupMember}
        onClose={() => setGroupMember(false)}
        heading={"Group Members"}
        groupMembers={group.members}
      /> */}
        <GroupMembersModal visible={groupMember}
          groupMembers={group1?.results || group?.members}
          onClose={() => setGroupMember(false)}
          token={token}
          heading= {t("home.groupMembers")}   />
        <AddFrindModal
          visible={addFrindModal}
          token={token}
          groupId={groupId}
          fetchGroups={fetchGroups}
          onClose={(d) => {
            if (Array.isArray(d)) {
              setUserCount1(prev => prev + d?.length);
            }
            fetchGroups()
            setAddFrindModal(false);
          }}

        />
        {exitGroupModal && <LogoutModal
          visible={exitGroupModal}
          title={t("common.exitGroup")}
          details={t("common.groupProceed")}
          onCancel={() => setExitGroupModal(false)}
          onConfirm={() => {
            hanldeleaveGroup(token, groupId);
            setExitGroupModal(false);
            handleLogOutMsg()
            // TODO: Call logout logic here (e.g., clearing tokens, navigating to login screen)
          }}
        />}
        {toestMess && (
          <SuccessMessageCustom
            textColor={Color.whiteText}
            color={toestMessColorGreen ? Color.green : Color.red}
            message={t("errorMessage.leftthe")}
          />
        )}

        {deletegroupModal &&
          <LogoutModal

            visible={deletegroupModal}
            title={t("home.deleteGroup")}
            details={t("home.deleteGroupConfirmation")}
            onCancel={() => setDeletegroupModal(false)}
            onConfirm={() => {
              setDeletegroupModal(false);
            }}
          />
        }
        {/* </Pressable> */}
      </View>
    </Modal>
  );
};

export default GroupSettingModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,

  },
  modalContainer: {
    flex: 1,

    paddingHorizontal: 20,
    paddingTop: 16,
    //  paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  // handleBar: {
  //   width: 40,
  //   height: 5,
  //   backgroundColor: '#555',
  //   borderRadius: 3,
  //   alignSelf: 'center',
  //   // marginBottom: 16,
  // },
  headerSection: {
    // marginTop:14,
    alignItems: 'center',

    justifyContent: 'center',
    // marginBottom: 10,
  },
  avatarsContainer: {
    // flexDirection: 'row',
    alignItems: 'center',
  },
  // avatar: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   borderWidth: 2,
  //   borderColor: '#fff',
  // },
  // countBadge: {
  //   backgroundColor: '#00AEEF',
  //   borderRadius: 10,
  //   paddingHorizontal: 6,
  //   height: 20,
  //   marginLeft: 6,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // countText: {
  //   color: '#fff',
  //   fontSize: 12,
  //   fontWeight: 'bold',
  // },
  groupNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    // backgroundColor:'center',
    justifyContent: 'center',
    width: '90%'

  },
  groupName: {
    color: Color.whiteText,
    fontSize: 18,
    fontFamily: font.PoppinsBold,
    lineHeight: 24,
    textAlign: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomColor: Color.lightGrayText,
    borderBottomWidth: 0.6,
  },
  optionText: {
    marginLeft: 12,
    marginRight: 33,
    fontSize: 16,
    color: '#fff',
    fontFamily: font.PoppinsMedium,
    textAlign: "center"

  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    // alignSelf: 'center',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: font.PoppinsBold,
    color: Color.whiteText,
    lineHeight: 20,
    flex: 1,
    marginRight: 25,

  },
  icon: {
    width: 24,
    height: 24,


  },
});
