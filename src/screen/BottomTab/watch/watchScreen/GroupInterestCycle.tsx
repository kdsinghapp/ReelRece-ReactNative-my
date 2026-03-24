import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Color } from '@theme/color';
import font from '@theme/font';
import moment from 'moment';
import CustomText from '@components/common/CustomText/CustomText';
import imageIndex from '@assets/imageIndex';
import { BASE_IMAGE_URL } from '@config/api.config';
const GroupInterestCycle = ({ group,
  onGroupSelect,
  isMultiSelectMode,
  selectedGroupIds }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const creator = group?.createdBy || group?.members?.[0] || null;

  const interestUsers = React.useMemo(() => {
    if (!group?.activities || group.activities.length === 0) {
      const membersExceptCreator = group?.members?.filter(
        (m) => creator && (m.username !== creator.username && m.username !== creator)
      ) || [];
      
      const creatorName = creator?.name || creator?.username || 'Owner';
      const memberCount = membersExceptCreator.length;
      let addedText = '';

      if (memberCount === 1) {
        addedText = `${membersExceptCreator[0]?.name || membersExceptCreator[0]?.username}`;
      } else if (memberCount === 2) {
        addedText = `${membersExceptCreator[0]?.name || membersExceptCreator[0]?.username} & ${membersExceptCreator[1]?.name || membersExceptCreator[1]?.username}`;
      } else if (memberCount > 2) {
        addedText = `${membersExceptCreator.slice(0, 2).map(m => m.name || m.username).join(', ')} & ${memberCount - 2} others`;
      }

      if (!addedText) addedText = 'created the group';

      return [
        {
          userName: creatorName,
          avatar: creator?.avatar || '/avatar/default.jpg',
          isAddedActivity: true,
          userInterest: {
            action: addedText === 'created the group' ? '' : 'added',
            actionTime: null,
            movieName: addedText === 'created the group' ? 'created the group' : `${addedText} to the group`,
          },
        },
      ];
    }

    const processed = [];
    const groupCreationActivity = group.activities.find(a => a.preference === 'created_group');

    if (groupCreationActivity) {
      const creatorName = groupCreationActivity.user?.name || groupCreationActivity.user?.username || 'Owner';
      
      processed.push({
        userName: creatorName,
        avatar: groupCreationActivity.user?.avatar || '/avatar/default.jpg',
        preference: 'created_group',
        userInterest: {
          action: 'created the group',
          actionTime: groupCreationActivity?.pref_record_date || null,
          movieName: '', 
        }
      });

      const creatorAdded = group.activities.filter(a => a.preference === 'added' && a.user?.username === groupCreationActivity.user?.username);
      if (creatorAdded.length > 0) {
        const addedMembers = creatorAdded.map(a => a.another_user?.name || a.another_user?.username || 'Someone').filter(Boolean);
        let formattedMembers = '';
        
        if (addedMembers.length === 1) {
          formattedMembers = addedMembers[0];
        } else if (addedMembers.length === 2) {
          formattedMembers = `${addedMembers[0]} & ${addedMembers[1]}`;
        } else if (addedMembers.length > 2) {
          formattedMembers = `${addedMembers.slice(0, -1).join(', ')} & ${addedMembers[addedMembers.length - 1]}`;
        }

        processed.push({
          userName: creatorName,
          avatar: groupCreationActivity.user?.avatar || '/avatar/default.jpg',
          preference: 'added',
          userInterest: {
            action: 'added',
            actionTime: creatorAdded[0]?.pref_record_date || null,
            movieName: `${formattedMembers} to the group`,
          }
        });
      }
    }

    group.activities.forEach((activity) => {
      if (activity.preference === 'created_group') return;
      if (activity.preference === 'added' && groupCreationActivity && activity.user?.username === groupCreationActivity.user?.username) return;

      const member = group?.members?.find(
        (mem) => mem?.username === activity.user?.username
      );

      let action = '';
      let movieName = '';

      if (activity.preference === 'like') {
        action = 'liked';
        movieName = activity.movie?.title || 'a movie';
      } else if (activity.preference === 'dislike') {
        action = 'disliked';
        movieName = activity.movie?.title || 'a movie';
      } else if (activity.preference === 'added') {
        action = 'added';
        movieName = `${activity.another_user?.name || activity.another_user?.username || 'someone'} to the group`;
      }

      processed.push({
        userName: member?.name || activity.user?.username || 'Unknown User',
        avatar: member?.avatar || '/avatar/default.jpg',
        preference: activity.preference,
        userInterest: {
          action: action,
          actionTime: activity?.pref_record_date || null,
          movieName: movieName,
        },
      });
    });

    return processed;
  }, [group, creator]);

  useEffect(() => {
    if (interestUsers.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % interestUsers.length);
    }, 4000); // Cycle every 4 seconds

    return () => clearInterval(interval);
  }, [interestUsers.length]);

  const isSelected = Array.isArray(selectedGroupIds) && selectedGroupIds?.includes(group?.groupId);
  const user = interestUsers?.[currentIndex] ?? null;
  const interest = user?.userInterest ?? null;

  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) {
      slideAnim.setValue(50);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true })
      ]).start();
    }
  }, [currentIndex, user]);

  const getTimeAgo = (timeValue) => {
    if (!timeValue) return '';
    const isRelative = typeof timeValue === 'string' && /(min|sec|hour|yesterday|ago)/i.test(timeValue);
    if (isRelative) return timeValue;

    let past = moment(timeValue, ['YYYY-MM-DDTHH:mm:ssZ', 'DD MMM YYYY'], true);
    if (!past.isValid()) past = moment(timeValue, 'DD MMM YYYY');
    if (!past.isValid()) return ''; 

    const now = moment();
    const diffInSeconds = now.diff(past, 'seconds');
    const diffInMinutes = now.diff(past, 'minutes');
    const diffInHours = now.diff(past, 'hours');
    const diffInDays = now.diff(past, 'days');

    if (diffInSeconds < 60) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}  min ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return past.format('DD MMM'); 
  };

  return (
    <View style={styles.groupInfo}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }} >
        <CustomText
          size={15}
          color={Color.whiteText}
          style={[styles.groupName, { marginBottom: interest ? 5 : 30 }]}
          font={font.PoppinsBold}
          numberOfLines={1}
        >
          {group?.groupName} 
        </CustomText>
        {isMultiSelectMode && (
          <TouchableOpacity
            onPress={() => onGroupSelect(group)}
            activeOpacity={0.8}
            style={{
              height: 18,
              width: 18,
              borderWidth: isSelected ? 0 : 0.6,
              borderColor: 'white',
              backgroundColor: isSelected ? Color.primary : "transparent",
              borderRadius: 4,
              marginLeft: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isSelected && (
              <Image source={imageIndex.Check} style={{ height: 16, width: 16 }} resizeMode="contain" />
            )}
          </TouchableOpacity>
        )}
        {group?.isMuted && !isMultiSelectMode && (
          <Image
            source={imageIndex.mutedIcon}
            resizeMode='contain'
            style={{ width: 16, height: 16, marginLeft: 6, tintColor: 'gray' }}
          />
        )}
      </View>

      {user && (
        <Animated.View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
            justifyContent: 'space-between',
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          }}
        >
          <View style={{ flexDirection: 'row', flex: 1, flexShrink: 1, alignItems: 'flex-start' }}>
            <Image
              source={{ uri: `${BASE_IMAGE_URL}${user.avatar}` }}
              style={{ height: 20, width: 20, borderRadius: 10, marginRight: 6 }}
            />
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', flexShrink: 1, maxWidth: '90%', marginTop: 2.5 }}>
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: 12,
                  fontFamily: font.PoppinsRegular,
                  marginRight: 4,
                  color: Color.lightGrayText,
                  lineHeight: 14,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {user?.userName}
              </Text>

              {interest?.action && (
                <CustomText
                  size={12}
                  lineHeight={14}
                  color={Color.whiteText}
                  style={{
                    color: interest?.action === 'liked' ? 'lightgreen' : interest?.action === 'disliked' ? 'red' : interest?.action === 'created the group' ? '#00AFFF' : Color.whiteText,
                    marginRight: 3,
                  }}
                  font={font.PoppinsRegular}
                  numberOfLines={1}
                >
                  {interest?.action}
                </CustomText>
              )}

              <CustomText
                size={12}
                color={Color.primary}
                style={{ marginRight: 6, flexShrink: 1, fontFamily: font.PoppinsRegular }}
                font={font.PoppinsRegular}
                numberOfLines={1}
              >
                {interest?.movieName}
              </CustomText>
            </View>
          </View>
          
          <View style={{ alignSelf: 'flex-end' }}>
            <CustomText
              size={10}
              color={Color.textGray}
              font={font.PoppinsRegular}
              numberOfLines={1}
            >
              {getTimeAgo(interest?.actionTime)}
            </CustomText>
          </View>
        </Animated.View>
      )}
    </View>
  );
};


export default React.memo(GroupInterestCycle);

const styles = StyleSheet.create({
  groupInfo: {
    flex: 1,
  },
  groupName: {
    alignContent: 'flex-start',
    marginBottom: 4,
    width: '85%'
  },
})

