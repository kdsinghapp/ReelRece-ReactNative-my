import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import imageIndex from '@assets/imageIndex';
import { Color } from '@theme/color';
import { useRoute } from '@react-navigation/native';
import ProfilePhotoCom from '@components/common/ProfilePhotoCom/ProfilePhotoCom';
import { followUser, getFollowers, getFollowing, getSuggestedFriends, unfollowUser } from '@redux/Api/followService';
import { RootState } from '@redux/store';
import { useSelector } from 'react-redux';
import font from '@theme/font';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatusBarCustom from '@components/common/statusBar/StatusBarCustom';
import { HeaderCustom, SearchBarCustom } from '@components/index';
import { BASE_IMAGE_URL } from '@config/api.config';
import { t } from 'i18next';


const FollowersScreen = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const route = useRoute();
  const { tabToOpen, userName } = route.params || {};
  // const userName = useSelector((state: RootState) => state.auth.userGetData.name);
   const initialData = {
    Followers: [],
    Following: [],
    Suggested: [],
  };
  const tabs = Object.keys(initialData);
  const [userData, setUserData] = useState(initialData);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);


 
  useEffect(() => {
    if (tabToOpen !== undefined && tabToOpen >= 0 && tabToOpen < tabs.length) {
      setActiveTab(tabToOpen);
    }
  }, [tabToOpen]);

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    // setIsLoading(true);
    try {
      const key = tabs[activeTab];
      if (key === 'Followers') {
        const res = await getFollowers(token, search);
        // Null-safe: use optional chaining and default to empty array
        setUserData(prev => ({ ...prev, Followers: res?.results ?? [] }));
      } else if (key === 'Following') {
        const res = await getFollowing(token, search);
        setUserData(prev => ({ ...prev, Following: res?.results ?? [] }));
      } else if (key === 'Suggested') {
        const res = await getSuggestedFriends(token, search);
        setUserData(prev => ({ ...prev, Suggested: res?.results ?? [] }));
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setIsLoading(false);
    }
  };
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
    
    // ✅ Guard: Ensure userData[key] is an array
    const currentUserList = Array.isArray(userData[key]) ? userData[key] : [];
    const updatedList = currentUserList.map((u: object | string) =>
      u?.username === username ? { ...u, following: !u.following } : u
    );

    try {
      const user = currentUserList.find((u:  object | string) => u?.username === username);
      if (!user) return;

      if (user.following) {
        await unfollowUser(token, username);
      } else {
        await followUser(token, username);
      }

      setUserData(prev => ({ ...prev, [key]: updatedList }));
    } catch (error) {
     }
  }, [activeTab, userData, token]);
  useEffect(() => {
    if (tabs[activeTab] === 'Suggested') {
      const timeout = setTimeout(() => {
        fetchUsers();
      }, 300); // debounce

      return () => clearTimeout(timeout);
    }
  }, [search, activeTab, tabs]);
  const renderItem = useCallback(({ item }) => (
    <View style={styles.userRow}>
      <View style={styles.avatarContainer}>
        <ProfilePhotoCom item={item} imageUri={`${BASE_IMAGE_URL}${item.avatar}`} />
      </View>
      <Text style={styles.userName}>{item?.name ? item?.name : item?.username}</Text>

      <TouchableOpacity
        style={[styles.followprimary, item.following && styles.followingprimary]}
        // onPress={() => toggleFollow(item.id)}
        onPress={() => toggleFollow(item.username)}
      >
        <Text style={[styles.followText, item.following && styles.followingText]}>
          {item.following ? t("common.following") : t("common.follow")}
        </Text>
      </TouchableOpacity>
    </View>
  ), [toggleFollow]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Color.background }}>
      <StatusBarCustom />
      <View style={{ marginBottom: 10 }} />
      <HeaderCustom title={userName} backIcon={imageIndex.backArrow} />
      <View style={styles.container}>
        <View style={[styles.tabRow, { marginTop: 14 }]}>
          {tabs.map((tab, index) => (
            <TouchableOpacity key={index} onPress={() => setActiveTab(index)} style={styles.tabprimary}>
           
              <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>
  {(tab === 'Followers' || tab === 'Following') ? userData[tab]?.length : ''} {tab}
</Text>

              {activeTab === index && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.marginH15}>
          {/* <SearchBarCustom
            placeholder="Search Followers"
            value={search}
            onSearchChange={setSearch}
          /> */}

          <SearchBarCustom
            placeholder={
              tabs[activeTab] === t("home.suggested") 
                ?  t("home.searchsuggested")   
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
              {/* <ActivityIndicator size="large" color={Color.primary} /> */}
              <Text style={styles.loadingText}>{t("discover.loading")}</Text>
            </View>
          ) : (
            <FlatList
              data={activeUsers}
              keyExtractor={item => item.username}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              style={{ marginTop: 15 }}
              contentContainerStyle={{ paddingBottom: 130 }}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={7}
              removeClippedSubviews
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{t("emptyState.nousers")}</Text>
                </View>
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

  tabTextActive: { color: Color.whiteText, fontWeight: 'bold' },
  tabUnderline: { height: 3, backgroundColor: Color.primary, width: '60%', marginTop: 4, },
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
});

export default React.memo(FollowersScreen);