


import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import styles from './style';
import ProfilePhotoCom from '@components/common/ProfilePhotoCom/ProfilePhotoCom';
import { getPendingGroupInvites, respondToGroupInvitation } from '@redux/Api/NotificationApi';
import { RootState } from '@redux/store';
 import { Color } from '@theme/color';
import { appNotification } from '@redux/Api/authService';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenNameEnum from '@routes/screenName.enum';
import RankingCard from '@components/ranking/RankingCard';
import imageIndex from '@assets/imageIndex';
import { CustomStatusBar } from '@components/index';
import { t } from 'i18next';
import { BASE_IMAGE_URL } from '@config/api.config';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Type for each feed item
type FeedItem = {
  id: string;
  name: string;
  avatar: string;
  action: 'invited' | 'ranked';
  movie: string;
  timeAgo: string;
  online: boolean;
  rating?: number;
  groupId?: string;
};

const Notification = ({ visible, onClose, bgColor }: boolean | { bgColor: string }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const navigation = useNavigation();
  const [pendingInvites, setPendingInvites] = useState<FeedItem[]>([]);
  const [isLoading, setIsloading] = useState(false);
  const [isNonNotification, setIsNonNotification] = useState(false);

  // Combine both
  const combinedFeed: FeedItem[] = pendingInvites;

  // API Call
  useEffect(() => {
    const fetchInvites = async () => {
      try {
        setIsloading(true)
        const data = await getPendingGroupInvites(token);
        const formatted: FeedItem[] = data?.results?.map((invite, index) => ({
          id: invite.group_id.group_id || `invite-${index}`,
          groupId: invite.group_id.group_id,  // ✅ Required for API call
          name: invite.invited_by.name,
          avatar: `${BASE_IMAGE_URL}${invite.invited_by.avatar}`,
          action: 'invited',
          movie: invite.group_id.name,
          timeAgo: 'Just now',
          online: false,
        })) || [];
         let emptyData = formatted.length

        setIsNonNotification(formatted.length <= 0);
        setPendingInvites(formatted);
      } catch (error) {
       } finally {
        setIsloading(false)
      }
    };

    if (token) {
      fetchInvites();
    }
  }, [token]);

  useEffect(() => {
    const appNotification_call = async () => {
      try {
        await appNotification(token);
      } catch (error) {
       }
    };

    if (token) {
      appNotification_call();
    }
  }, [token]);


  // Single Feed Card
  const FeedCard = ({ item  }: { item: FeedItem }) => {
    const handleAccept = async () => {
      if (!item.groupId) return;
      try {
        const res = await respondToGroupInvitation(token, item.groupId, true);
         // ✅ Safe array filter
        setPendingInvites((prev) => (prev || []).filter(i => i?.groupId !== item.groupId));
      } catch (err) {
       }
    };

    const handleDecline = async () => {
      if (!item.groupId) return;
      try {
        const res = await respondToGroupInvitation(token, item.groupId, false);
         // ✅ Safe array filter  
        setPendingInvites((prev) => (prev || []).filter(i => i?.groupId !== item.groupId));
      } catch (err) {
       }
    };
    if (isLoading) {
      return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size={'large'} color={Color.primary} />
        </View>
      );
    }

    return (
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          {typeof item.avatar === 'string' ? (
            <ProfilePhotoCom imageUri={item.avatar} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={item.avatar} style={styles.avatar} />
              {item.online && <View style={styles.onlineIndicator} />}
            </View>
          )}
          <TouchableOpacity
            style={styles.content}
            onPress={() => navigation.navigate(ScreenNameEnum.MovieDetailScreen)}
          >
            <View style={styles.row}>
              <Text style={styles.name}>{item?.name}</Text>
              <Text style={styles.action}>
                {item?.action === 'invited' ? ' invited you to join' : ' ranked'}
              </Text>
            </View>
            <Text style={styles.movie}>{item?.movie}</Text>
            <Text style={styles.time}>{item?.timeAgo}</Text>
          </TouchableOpacity>
          <RankingCard ranked={item?.rating} />
        </View>
        {item.action === 'invited' && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.accept} onPress={handleAccept}>
              <Text style={styles.buttonText}>{(t("home.accept"))}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.decline} onPress={handleDecline}>
              <Text style={styles.buttonText}>{(t("home.decline"))}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[
          styles.container,
          {
            height: SCREEN_HEIGHT,
            backgroundColor: bgColor ? 'rgba(14, 13, 13, 0.9)' : Color.background,
          },
        ]}
      >
        <CustomStatusBar />
        <View style={[styles.headerContainer,{
          marginTop: Platform.OS === 'ios' ? 55 : 4
        }]}>
          <View style={styles.headerSide}>
            <TouchableOpacity onPress={onClose}>
              <Image source={imageIndex.backArrow} style={styles.icon} resizeMode="contain" />
            </TouchableOpacity>
          </View>
          <View style={styles.titleCenter}>
            <Text style={styles.title}>{(t("home.notification"))}</Text>
          </View>
          <View style={styles.headerSide} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            { padding: 16, paddingBottom: 40 },
            isNonNotification && {
              flexGrow: 1,
              minHeight: SCREEN_HEIGHT - 180,
            },
          ]}
        >
          {isNonNotification ? (
            <View
              style={[
                styles.emptyStateContainer,
                Platform.OS === 'ios' && { minHeight: SCREEN_HEIGHT - 220 },
              ]}
            >
              <Text style={styles.noNotiText}>
                {t('emptyState.notificartionn_not')}
              </Text>
            </View>
          ) : (

            <View>
              {combinedFeed.map((item) => (
                <FeedCard
                  key={
                    item?.id ||
                    item?.groupId ||
                    `${item?.name}-${item?.timeAgo}-${item?.movie}`
                  }
                  item={item}
                />
              ))}

            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default React.memo(Notification);


