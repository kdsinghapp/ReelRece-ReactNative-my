import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import { useNavigation, useRoute } from '@react-navigation/native';
import ProfilePhotoCom from '@components/common/ProfilePhotoCom/ProfilePhotoCom';
import { followUser, getFollowers, getFollowing, getSuggestedFriends, unfollowUser } from '@redux/Api/followService';
import { RootState } from '@redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHomeFeed, fetchHomeRecentUsers } from '@redux/feature/homeSlice';
import font from '@theme/font';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatusBarCustom from '@components/common/statusBar/StatusBarCustom';
import { HeaderCustom, SearchBarCustom } from '@components/index';
import { BASE_IMAGE_URL } from '@config/api.config';
import { t } from 'i18next';
import { RefreshControl } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import ScreenNameEnum from '@routes/screenName.enum';

const PAGE_SIZE = 15;

const Followers = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const route = useRoute();
  const params = (route?.params || {}) as {
    tabToOpen?: number;
    userName?: string;
    user_name?: string;
    followersCount?: number;
    followingCount?: number;
  };
  const { tabToOpen, userName, user_name, followersCount: paramFollowersCount, followingCount: paramFollowingCount } = params;
  const otherUsername = (userName ?? user_name) as string | undefined;
  /** Username for API query param ?username= (other user's username) */
  const usernameForApi = user_name as string | undefined;

  const initialData = {
    Followers: [],
    Following: [],
    Suggested: [],
  };
  const tabs = Object.keys(initialData);
  const [userData, setUserData] = useState(initialData);
  const [activeTab, setActiveTab] = useState(() => {
    const open = (route?.params as { tabToOpen?: number })?.tabToOpen;
    if (typeof open === 'number' && open >= 0 && open < 3) return open;
    return 0;
  });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [currentPage, setCurrentPage] = useState<Record<string, number>>({
    Followers: 1,
    Following: 1,
    Suggested: 1,
  });
  const [totalPages, setTotalPages] = useState<Record<string, number>>({
    Followers: 1,
    Following: 1,
    Suggested: 1,
  });
  const [totalCount, setTotalCount] = useState<Record<string, number>>({
    Followers: paramFollowersCount ?? 0,
    Following: paramFollowingCount ?? 0,
    Suggested: 0,
  });
  const isFetchingRef = useRef(false);

  /** When opening with count params, keep tab counts in sync (e.g. after navigation from profile) */
  useEffect(() => {
    if (typeof paramFollowersCount === 'number' && paramFollowersCount >= 0) {
      setTotalCount(prev => ({ ...prev, Followers: paramFollowersCount }));
    }
    if (typeof paramFollowingCount === 'number' && paramFollowingCount >= 0) {
      setTotalCount(prev => ({ ...prev, Following: paramFollowingCount }));
    }
  }, [paramFollowersCount, paramFollowingCount]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(prev => ({ ...prev, [tabs[activeTab]]: 1 }));
    setTotalPages(prev => ({ ...prev, [tabs[activeTab]]: 1 }));
    fetchUsers(1, true).finally(() => setRefreshing(false));
  }, [activeTab]);

  useEffect(() => {
    const open = (route?.params as { tabToOpen?: number })?.tabToOpen;
    if (typeof open === 'number' && open >= 0 && open < tabs.length) {
      setActiveTab(open);
    }
  }, [tabToOpen, route?.params]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    const key = tabs[activeTab];
    setCurrentPage(prev => ({ ...prev, [key]: 1 }));
    setTotalPages(prev => ({ ...prev, [key]: 1 }));
    fetchUsers(1, true);
  }, [activeTab, token, usernameForApi]);

  const fetchUsers = useCallback(
    async (page: number = 1, reset: boolean = false) => {
      if (isFetchingRef.current || !token) return;
      const key = tabs[activeTab];
      isFetchingRef.current = true;
      if (reset) {
        setIsLoading(true);
      } else {
        setLoadingMore(true);
      }
      try {
        let res: {
          results?: unknown[];
          current_page?: number;
          total_pages?: number;
          count?: number;
          data?: { results?: unknown[] };
        };
        if (key === 'Followers') {
          res = await getFollowers(token, search, page, PAGE_SIZE, usernameForApi);
        } else if (key === 'Following') {
          res = await getFollowing(token, search, page, PAGE_SIZE, usernameForApi);
        } else {
          res = await getSuggestedFriends(token, search, page, PAGE_SIZE);
        }
        const raw = res?.results ?? res?.data?.results ?? (Array.isArray(res) ? res : []);
        const results = Array.isArray(raw) ? raw : [];
        const currentPageNum = Number(res?.current_page ?? page);
        const totalPagesNum = Number(res?.total_pages ?? 1);
        const r = res as { count?: number; total_count?: number };
        const apiCount =
          typeof r?.count === 'number'
            ? r.count
            : typeof r?.total_count === 'number'
              ? r.total_count
              : null;

        setUserData(prev => {
          const current = Array.isArray(prev[key]) ? prev[key] : [];
          const next = reset && page === 1 ? results : [...current, ...results];
          return { ...prev, [key]: next };
        });
        setCurrentPage(prev => ({ ...prev, [key]: currentPageNum }));
        setTotalPages(prev => ({ ...prev, [key]: totalPagesNum }));
        if (apiCount !== null) {
          setTotalCount(prev => ({ ...prev, [key]: apiCount }));
        }
      } catch (error) {
        if (reset && page === 1) {
          setUserData(prev => ({ ...prev, [key]: prev[key] ?? [] }));
        }
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
        setLoadingMore(false);
      }
    },
    [activeTab, search, token, usernameForApi]
  );
  const activeUsers = useMemo(() => {
    const key = tabs[activeTab];
    const users = userData[key] || [];

    if (key === 'Suggested') return users;
    if (!search.trim()) return users;
    return users.filter(user =>
      user.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeTab, search, userData]);

  const toggleFollow = useCallback(async (username: string) => {
    const key = tabs[activeTab];
 
    const currentUserList = Array.isArray(userData[key]) ? userData[key] : [];
    const updatedList = currentUserList.map((u: object | string) =>
      u?.username === username ? { ...u, following: !u.following } : u
    );

    try {
      const user = currentUserList.find((u: object | string) => u?.username === username);
      if (!user) return;

      if (user.following) {
        await unfollowUser(token, username);
      } else {
        await followUser(token, username);
      }

      setUserData(prev => ({ ...prev, [key]: updatedList }));
      dispatch(fetchHomeFeed({ silent: true }));
      dispatch(fetchHomeRecentUsers({ silent: true }));
    } catch (error) {
    }
  }, [activeTab, userData, token, dispatch]);
  useEffect(() => {
    if (tabs[activeTab] === 'Suggested') {
      const timeout = setTimeout(() => {
        setCurrentPage(prev => ({ ...prev, Suggested: 1 }));
        setTotalPages(prev => ({ ...prev, Suggested: 1 }));
        fetchUsers(1, true);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [search, activeTab]);

  const key = tabs[activeTab];
  const hasMore = (currentPage[key] ?? 1) < (totalPages[key] ?? 1);

  const handleEndReached = useCallback(() => {
    if (isLoading || loadingMore || !hasMore) return;
    const page = (currentPage[key] ?? 1) + 1;
    if (page <= (totalPages[key] ?? 1)) {
      fetchUsers(page, false);
    }
  }, [isLoading, loadingMore, hasMore, currentPage, totalPages, key, fetchUsers]);

  const renderListFooter = useCallback(() => {
    if (loadingMore) {
      return (
        <View style={{ paddingVertical: 16, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Color.primary} />
          <Text style={{ color: Color.textGray, marginTop: 8 }}>
            {t('discover.loading')} {(currentPage[key] ?? 1) + 1}/{totalPages[key] ?? 1}
          </Text>
        </View>
      );
    }
    if (!hasMore && activeUsers.length > 0) {
      return (
        <View style={{ paddingVertical: 16, alignItems: 'center' }}>
          <Text style={{ color: Color.textGray }}>
            {/* {t('discover.noMore') || 'No more'} */}
          </Text>
        </View>
      );
    }
    return null;
  }, [loadingMore, hasMore, activeUsers.length, currentPage, totalPages, key]);
  const navigation = useNavigation();
  const renderItem = useCallback(({ item }) => (
    <View style={styles.userRow}>
      <View style={styles.avatarContainer}>
        <ProfilePhotoCom item={item} imageUri={`${BASE_IMAGE_URL}${item.avatar}`} />
      </View>
      <Text onPress={() => navigation.navigate(ScreenNameEnum.OtherProfile, { item: item })} style={styles.userName}>{item?.name ? item?.name : item?.username}</Text>

      <TouchableOpacity
        style={[styles.followprimary, item.following && styles.followingprimary]}
        // onPress={() => toggleFollow(item.id)}
        onPress={() => toggleFollow(item?.username)}
      >
        <Text style={[styles.followText, item?.following && styles.followingText]}>
          {item?.following ? t("common.following") : t("common.follow")}
        </Text>
      </TouchableOpacity>
    </View>
  ), [toggleFollow]);


  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isConnected && state.isConnected;
      setIsConnected(state.isConnected);

      if (wasOffline && activeUsers.length === 0) {
        fetchUsers(1, true);
      }
      if (!wasOffline) {
     }
    });

    return () => unsubscribe();
  }, [isConnected, activeUsers.length]);
  return (
    <SafeAreaView  edges={isConnected ? ['top'] : []} style={{ flex: 1, backgroundColor: Color.background }}>
      <StatusBarCustom />
      <View style={{ marginBottom: 10 }} />
      <HeaderCustom title={otherUsername} backIcon={imageIndex.backArrow} />
      <View style={styles.container}>
        <View style={[styles.tabRow, { marginTop: 14 }]}>
          {tabs.map((tab, index) => (
            <TouchableOpacity key={index} onPress={() => setActiveTab(index)} style={styles.tabprimary}>

              <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>
                {(tab === 'Followers' || tab === 'Following')
                  ? (totalCount[tab] > 0 ? totalCount[tab] : (userData[tab]?.length ?? 0))
                  : ''}{' '}
                {tab}
              </Text>

              {activeTab === index && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.marginH15}>
 
          <SearchBarCustom
            placeholder={
              tabs[activeTab] === t("home.suggested")
                ? t("home.searchsuggested")
                : tabs[activeTab] === 'Following'
                  ? t("home.searchfollowing")
                  : t("home.searchfollowers")
            }
            value={search}
            onSearchChange={setSearch}
          />

        </View>
        <View style={styles.marginH15}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Color.primary} />
              <Text style={styles.loadingText}>{t("discover.loading")}</Text>
            </View>
          ) : (
            <FlatList
              data={activeUsers}
              keyExtractor={(item, index) => item?.username ? `user-${item.username}-${index}` : `user-${index}`}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              style={{ marginTop: 15 }}
              contentContainerStyle={{ paddingBottom: 130 }}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={7}
              removeClippedSubviews
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.3}
              ListFooterComponent={renderListFooter}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[Color.primary]}
                  tintColor={Color.primary}
                />
              }
              ListEmptyComponent={
                !isLoading ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{t("emptyState.nousers")}</Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Color.background },
  tabRow: { flexDirection: 'row', marginBottom: 20 },
  tabprimary: { flex: 1, alignItems: 'center' },

  tabText: { color: Color.placeHolder, fontSize: 14, fontFamily: font.PoppinsMedium },

  tabTextActive: { color: Color.whiteText, fontFamily: font.PoppinsBold, fontSize: 14, },
  tabUnderline: { height: 2.2, backgroundColor: Color.primary, width: '60%', marginTop: 4, },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatarContainer: { position: 'relative', marginRight: 12 },
  userName: { flex: 1, color: Color.whiteText, fontSize: 14, fontFamily: font.PoppinsMedium },
  followprimary: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: Color.primary,
    borderRadius: 8,
    width: 116,
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
  },
  followingprimary: {
    backgroundColor: Color.background,
    borderColor: Color.whiteText,
    borderWidth: 0.5,
  },
  followText: {
    color: Color.whiteText,
    fontSize: 14,
    lineHeight: 16,
    fontFamily: font.PoppinsBold
  },
  followingText: {
    color: Color.whiteText,
    fontSize: 14,
    lineHeight: 16,
    fontFamily: font.PoppinsMedium,
  },
  marginH15: {
    marginHorizontal: 15
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    color: Color.whiteText,
    fontSize: 14,
    fontFamily: font.PoppinsMedium,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: Color.placeHolder,
    fontSize: 14,
    fontFamily: font.PoppinsMedium,
  },
  footerContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerLoadingText: {
    color: Color.textGray,
    marginTop: 8,
    fontSize: 14,
  },
  footerNoMoreText: {
    color: Color.textGray,
    fontSize: 14,
  },
});

export default React.memo(Followers);