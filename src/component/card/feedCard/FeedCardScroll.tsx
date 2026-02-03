import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
 import { BASE_IMAGE_URL } from '@config/api.config';
import MemoFeedCard from './MemoFeedCard';
   
const FeedCardScroll = ({
  data = [],
  fetchFeed,
  hasMore,
  loading,
  token,
  autoPlayEnabled,
  isMuted,
  visibleType,
  disablePlay // optional prop to stop play when horizontals visible
}) => {
  const [playIndex, setPlayIndex] = useState<number | null>(null);
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState<number | null>(null);

  const lastPlayedIndexRef = useRef<number | null>(null);
  const flatListRef = useRef(null);
  const restoreDoneRef = useRef(false);

  // Stable config
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 90, // quicker trigger than 90
    minimumViewTime: 100,
  }).current;

  // Stable callback (useRef .current) to avoid recreation
  const onViewableItemsChangedRef = useRef(({ viewableItems }) => {
    // quick guard: if play disabled by external horizontal lists, stop
    if (disablePlay) {
      if (playIndex !== null) setPlayIndex(null);
      return;
    }

    if (!viewableItems || viewableItems.length === 0) {
      if (playIndex !== null) setPlayIndex(null);
      return;
    }

    // find first feed item that looks like a video/feed card
    const feedItem = viewableItems.find(v => v?.item?.movie && v?.item?.user);
    if (!feedItem) {
      if (playIndex !== null) setPlayIndex(null);
      return;
    }

    const index = feedItem.index;
    // Only set when changed
    if (lastPlayedIndexRef.current !== index) {
      lastPlayedIndexRef.current = index;
      setCurrentVisibleIndex(index);
      setPlayIndex(index);
    }
  }).current;

  // restore last index once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('homeIndex');
        if (mounted && saved != null && !restoreDoneRef.current) {
          const idx = parseInt(saved, 10);
          if (!isNaN(idx)) {
            // set but avoid forcing scroll; just set play index after small delay
            lastPlayedIndexRef.current = idx;
            setCurrentVisibleIndex(idx);
            setPlayIndex(idx);
            restoreDoneRef.current = true;
          }
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Save index but debounce (simple guard: only save when changed)
  const savedRef = useRef(null);
  useEffect(() => {
    if (currentVisibleIndex == null) return;
    // avoid writing too often — only when changed
    if (savedRef.current !== currentVisibleIndex) {
      savedRef.current = currentVisibleIndex;
      AsyncStorage.setItem('homeIndex', currentVisibleIndex.toString()).catch(() => {});
    }
  }, [currentVisibleIndex]);

  // On unmount cleanup
  useEffect(() => {
    return () => {
      // nothing heavy here — no timers to clear
    };
  }, []);

  const renderItem = useCallback(
    ({ item, index }) => {
      if (!item || !item.movie || !item.user) return null;
      const avatarUri = `${BASE_IMAGE_URL}${item.user?.avatar}`;
      const posterUri = item.movie?.horizontal_poster_url;
      return (
        <MemoFeedCard
          key={item.movie?.imdb_id || `feed-${index}`}
          avatar={{ uri: avatarUri }}
          poster={{ uri: posterUri }}
          user={item.user?.name}
          title={item.movie?.title}
          comment={item.comment}
          release_year={String(item?.movie?.release_year || '')}
          videoUri={item.movie?.trailer_url}
          imdb_id={item.movie?.imdb_id}
          isMuted={isMuted}
          token={token}
// rankPress={() => setIsVisible(true)}
      ranked={item?.rec_score}
      created_date={item?.created_date}

          shouldAutoPlay={autoPlayEnabled}
          isVisible={index === currentVisibleIndex}
          shouldPlay={index === playIndex}
          isPaused={index !== playIndex}
        />
      );
    },
    [autoPlayEnabled, playIndex, currentVisibleIndex, isMuted, token]
  );

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.movie?.imdb_id || `feed-${index}`}
      onEndReached={() => {
        if (hasMore && !loading && typeof fetchFeed === 'function') fetchFeed('home');
      }}
      onEndReachedThreshold={0.6}
      viewabilityConfigCallbackPairs={useRef([
        { viewabilityConfig, onViewableItemsChanged: onViewableItemsChangedRef }
      ]).current}
      ListFooterComponent={() =>
        loading ? (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator size="small" />
          </View>
        ) : null
      }
      initialNumToRender={2}
      maxToRenderPerBatch={8}
      windowSize={10}
      removeClippedSubviews={true}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      decelerationRate={0.92}
// snapToInterval={itemHeight}
      // If items have fixed height, provide getItemLayout for best perf
    />
  );
};

export default React.memo(FeedCardScroll);




{/* <MemoFeedCard
          avatar={{ uri: avatarUri }}
      poster={{ uri: posterUri }}
      // poster={ source : require(imageIndex.THENOS1) }
      // poster={{ uri: require('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE-XiFGsiivMJ5EmeO1_ZnYkaNA4ktmNgsIA&s')  }}
      // poster={{ uri: 'https://i.pinimg.com/originals/87/99/6d/87996d079c129821bbadd2f69a1b1795.jpg' }}
 key={item.movie?.imdb_id} // <-- unique key per video
      // avatar={avatarObj}
      // poster={posterObj}
      user={item.user?.name}
      title={item.movie?.title}
      comment={item.comment}
      release_year={item?.movie?.release_year?.toString()}
      videoUri={item.movie?.trailer_url}
      imdb_id={item.movie?.imdb_id}
      isMuted={isMuted}
      token={token}
    //   rankPress={() => setIsVisible(true)}
      ranked={item?.rec_score}
      created_date={item?.created_date}
          shouldAutoPlay={autoPlayEnabled}
          isVisible={index === currentVisibleIndex}
          shouldPlay={index === playIndex}
          isPaused={index !== playIndex}
        /> */}