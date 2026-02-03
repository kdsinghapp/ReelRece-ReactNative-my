import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image, StyleSheet,
  ScrollView, TextInput, Dimensions, Alert,
  ActivityIndicator,
} from 'react-native';
import { Color } from '@theme/color';
import imageIndex from '@assets/imageIndex';
import { getAllFriends, getGroupMembers, searchFriends } from '@redux/Api/GroupApi';
 import FastImage from 'react-native-fast-image';
import _ from 'lodash';
import { useFocusEffect } from '@react-navigation/native';
import font from '@theme/font';
import { BASE_IMAGE_URL } from '@config/api.config';
import { t } from 'i18next';

interface Member {
  id: string;
  name: string;
  userImage: { uri: string };
  send: boolean;
  online: boolean;
}

interface Props {
  toggleSelect: (id: string) => void;
  setSearchFocused?: (value: boolean) => void;
  onSelectionChange?: (selected: Member[]) => void;
  type: string;
  token: string;
  setAddMembers?:(Members :Member[])=> void;
}

const SelectFriendCom: React.FC<Props> = ({
  setSearchFocused,
  onSelectionChange,
  type,
  token,
  setAddMembers,
  groupId
}: Props) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [isLoading, setIsLoading] = useState(false);
const [isLoadingMore, setIsLoadingMore] = useState(false);
const [isRefreshing, setIsRefreshing] = useState(false);
const isFetchingRef = useRef(false); // duplicate requests रोकेगा
const selectedIdsRef = useRef(new Set<string>());
const [searchResults, setSearchResults] = useState<Member[] | null>(null);
const PAGE_SIZE = 20;

const fetchFriendsPage = useCallback(async (opts: { page?: number; query?: string; replace?: boolean } = {}) => {
  const pageToLoad = opts?.page ?? 1;
  const q = opts?.query ?? search;

  // Prevent duplicate fetches
  if (isFetchingRef.current) return;
  isFetchingRef.current = true;

  try {
    // Set loading states
    if (pageToLoad === 1) setIsRefreshing(true);
    else setIsLoadingMore(true);
    setIsLoading(true);

    // Fetch API
    const resp = q
      ? await searchFriends(token, q, pageToLoad, PAGE_SIZE)
      : await getAllFriends(token, pageToLoad, PAGE_SIZE);

    const results = resp?.results ?? [];
     const formatted = results?.map(item => ({
      id: item?.username,
      name: item?.name,
      userImage: { uri: item?.avatar?.includes('http') ? item?.avatar : `${BASE_IMAGE_URL}${item.avatar}` },
      send: false,
      online: true,
    }));

 
    // Update members
   setMembers(prev => {
  const newMembers = formatted?.map(item => {
    const existing = prev?.find(m => m.id === item.id);
    return existing ? { ...item, send: existing.send } : item;
  });

  if (pageToLoad === 1 || opts?.replace) return newMembers;
  return [...prev, ...newMembers];
});


// setMembers(prev => {
//   const newMembers = formatted.map(item => {
//     // const existing = prev.find(m => m.id === item.id);
//     // return existing ? { ...item, send: existing.send } : item;
//     return formatted
//   });

//   if (pageToLoad === 1 || opts.replace) return formatted;
//   return [...prev, ...formatted];
// });
// setMembers(formatted)

    setPage(pageToLoad);
    setTotalPages(resp?.total_pages ?? 1);
  } catch (err) {
   } finally {
    isFetchingRef.current = false;
    setIsLoading(false);
    setIsLoadingMore(false);
    setIsRefreshing(false);
  }
}, [token]);


useFocusEffect(
  useCallback(() => {
    // Only fetch initial friends if search is empty and input is not focused
    if (!search?.trim()) {
      fetchFriendsPage({ page: 1, query: '', replace: true });
    }
  }, [ search])
);


// Debounced search
const debouncedSearch = useRef(_.debounce(async (q: string) => {
  // Only fetch if query is not empty, otherwise skip
  if (q.trim() === '') return;
  await fetchFriendsPage({ page: 1, query: q, replace: true });
}, 2000)).current;

useEffect(() => {
  debouncedSearch(search);
  // return () => debouncedSearch.cancel();
}, [search]);




// Filter members locally
const formattedFriends = useMemo(() => {
  if (!search.trim()) return members;
  return members.filter(m => {
    const displayName = m.name?.trim() || m.id;

     return displayName.toLowerCase();
    // return displayName.toLowerCase().includes(search.toLowerCase());
  });
}, [members, search]);
 

useEffect(()=> {
const re = formattedFriends
 }, [members, search]);

  const toggleSelect = useCallback((id: string) => {


    const updated = members.map((m) =>
      m.id === id ? { ...m, send: !m.send } : m
    );
     setMembers(updated);
     const selected = updated?.filter((m) => m.send);
    const filteridforAddfriend =  selected?.map((item)=> item.id)

     onSelectionChange?.(selected);
    setAddMembers?.(filteridforAddfriend);           //  selected members for add in group
  }, [members, onSelectionChange , setAddMembers , ]);

  const renderItem = useCallback(({ item }: { item: Member }) => (
    <TouchableOpacity style={styles.memberRow} onPress={() => toggleSelect(item?.id)} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        <FastImage
          source={{
            uri: item?.userImage?.uri,
            priority: FastImage.priority.low,
            cache: FastImage.cacheControl.immutable,
          }}
          style={styles.avatar}
          resizeMode={FastImage.resizeMode.stretch}
        />
        {item.online && <View style={styles.onlineIndicator} />}
      </View>
      <Text  allowFontScaling={false}  style={styles.memberName}>
  {item?.name && item?.name.trim() !== '' ? item?.name : item?.id}
</Text>
      {/* { item?.name &&  item?.name.trim() !== '' ? 
      <Text style={styles.memberName}>dfd</Text>
      : <Text style={styles.memberName}>{item?.name}</Text>
      } */}
      <TouchableOpacity
        style={[
          styles.checkbox,
          {
            backgroundColor: item?.send ? Color.primary : "transparent",
            borderWidth: item?.send ? 0 : 0.8,
          },
        ]}
        onPress={() => toggleSelect(item.id)}
      >
        {item?.send && (
          <Image style={styles.checkImg} source={imageIndex.Check} resizeMode="contain" />
        )}
      </TouchableOpacity>
      {/* + */}
    </TouchableOpacity>
  ), [members ,setAddMembers]);
  // ), [members ,setAddMembers]);



    const [addmembers1, setAddMembers2] = useState<string[]>([])
     useEffect(()=>{
        loadData()
    },[])
const loadData = async () => {
  try {
    const res = await getGroupMembers(token,groupId);
     setAddMembers2(res.results)
  } catch (e) {
   }
};

const filteredUsers = formattedFriends?.filter(user => {
  return !addmembers1?.some(a =>
    a?.username?.toLowerCase() === user?.id?.toLowerCase()
  );
});
   return (
    <View style={{ height: type === "Friend" ? Dimensions.get('window').height * 0.5 : Dimensions.get('window').height * 0.8 }}>
      <View style={styles.searchBar}>
        <Image source={imageIndex.search} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder= {t("common.search")}
           allowFontScaling={false} 
          placeholderTextColor={Color.placeHolder}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          onFocus={() => setSearchFocused?.(true)}
          onBlur={() => setSearchFocused?.(false)}
        />
        {search?.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Image style={styles.closeIcon} source={imageIndex.closeimg} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <FlatList
           data={filteredUsers}
          keyExtractor={(item) => item?.id}
          renderItem={renderItem}
          scrollEnabled={false}
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          initialNumToRender={18}
          removeClippedSubviews
          // horizontal
          maxToRenderPerBatch={24}
          showsVerticalScrollIndicator={false}
          //  onEndRe
          // ached={() => {
     //  Pagination
  onEndReached={() => {
    if (!isLoadingMore && page < totalPages) {
      fetchFriendsPage({ page: page + 1, query: search });
    }
  }}
  // onEndReachedThreshold={0.4}

  // ✅ Pull to refresh
  refreshing={isRefreshing}
  onRefresh={() => fetchFriendsPage({ page: 1, query: search, replace: true })}

  // ✅ Loader for pagination
  ListFooterComponent={() => isLoadingMore ? <ActivityIndicator style={{ margin: 12 }} color={Color.primary} /> : null}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: Color.grey,
    height: 45,
    borderRadius: 20,
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  searchIcon: {
    height: 20,
    width: 20,
    marginRight: 6,
  },
  closeIcon: {
    height: 18,
    width: 18,
  },
  searchInput: {
    flex: 1,
    color: Color.whiteText,
    height: 50,
    fontSize:14,
    fontFamily:font.PoppinsRegular
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 70,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    paddingHorizontal: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 35,
  },
  onlineIndicator: {
    position: 'absolute',
    right: 0,
    top: 2,
    width: 14,
    height: 14,
    borderRadius: 8,
    backgroundColor: 'lightgreen',
    borderWidth: 2.5,
    borderColor: Color.background,
  },
  memberName: {
    flex: 1,
    color: Color.whiteText,
    fontSize: 14,
    fontFamily:font.PoppinsMedium
  },
  checkbox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 0.7,
    borderColor: Color.whiteText,
  },
  itemSendSelect: {
    backgroundColor: Color.primary,
  },
  checkImg: {
    height: 14,
    width: 14,
  },
});

export default memo(SelectFriendCom);
