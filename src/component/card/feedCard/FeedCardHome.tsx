
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Video from 'react-native-video';
import imageIndex from '@assets/imageIndex';
import ScreenNameEnum from '@routes/screenName.enum';
import { Color } from '@theme/color';
import font from '@theme/font';
import { useTrailerTracker } from '@hooks/useTrailerTracker';
import { useBookmarks } from '@hooks/useBookmark';
import FastImage from 'react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { toggleMute } from '@redux/feature/videoAudioSlice';
import { fetchHomeBookmarks } from '@redux/feature/homeSlice';
import { invalid } from 'moment'
import { styles } from './FeedCardstyle';
import CompareModals from '@screens/BottomTab/ranking/rankingScreen/CompareModals';
import { useCompareComponent } from '@screens/BottomTab/ranking/rankingScreen/useCompareComponent';
import CustomText from '@components/common/CustomText/CustomText';
import RankingWithInfo from '@components/ranking/RankingWithInfo';
import ScoreIntroModal from '@components/modal/ScoreIntroModal/ScoreIntroModal';
import { t } from 'i18next';
import { followUser } from '@redux/Api/followService';
import { AxiosError } from 'axios';


const FeedCardHome = ({
  screenName, activity,
  avatar, user, title, comment, poster, videoUri, isPaused, shouldAutoPlay, is_bookMark, videoIndex,
  rankPress, isVisible, ranked, imdb_id, created_date, token, release_year, shouldPlay, scoreType, username,
  onBookmarkSuccess, suggested, onFollow, isFollowing: initialFollowing, feedData = []
}) => {
  const navigation = useNavigation();
  const [posterOpacity] = useState(new Animated.Value(1));
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef(null);
  const trailerTracker = useTrailerTracker(token);
  const videoUriRef = useRef(videoUri);
  const { toggleBookmark } = useBookmarks(token);
  const [showFirstModal, setShowFirstModal] = useState(false);
  const previousImdbRef = useRef<string | null>(null);
  const [paused, setPaused] = useState(shouldAutoPlay ? !isVisible : true);
  const isMuted = useSelector((state: RootState) => state.videoAudio.isMuted);
  const [isBookmarked, setIsBookmarked] = useState(!!is_bookMark);
  const [posterVisible, setPosterVisible] = useState(true);
  const [isFollowing, setIsFollowing] = useState(!!initialFollowing);
  const [followLoading, setFollowLoading] = useState(false);
  const dispatch = useDispatch()
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {

  }, [videoUriRef.current])

  const isPlaying = shouldAutoPlay && isVisible && shouldPlay && !paused;
  const isScreenFocused = useIsFocused();



  const hasInteractedRef = useRef(false);
  useEffect(() => {
    videoUriRef.current = videoUri;
  }, [videoUri]);

  useEffect(() => {
    const shouldPlayVideo = shouldAutoPlay && isVisible && shouldPlay;
    setPaused(!shouldPlayVideo);
  }, [shouldAutoPlay, isVisible, shouldPlay]);
  const stableVideoUri = useRef(videoUri);


  const handleVideoLoad = (data?: { duration?: number }) => {

    if (data?.duration) setVideoDuration(data.duration);
    setTimeout(() => {
      Animated.timing(posterOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => setPosterVisible(false));


    }, 1200);
  };
  useEffect(() => {
    setIsBookmarked(!!is_bookMark);
  }, [is_bookMark]);

  useEffect(() => {
    setIsFollowing(!!initialFollowing);
  }, [initialFollowing]);

  const handleToggleBookmark = async () => {
    const prev = isBookmarked;
    setIsBookmarked(!prev); // Optimistic update

    try {
      await toggleBookmark(imdb_id, token);
      dispatch(fetchHomeBookmarks({ silent: true }));
      onBookmarkSuccess?.();
    } catch (err) {
      setIsBookmarked(prev); // revert
    }
  };

  const handleFollowToggle = useCallback(async () => {
    if (!token || !username || followLoading) return;
    try {
      setFollowLoading(true);
      await followUser(token, username);
      setIsFollowing(true);
      onFollow?.(username);
    } catch (err) {
      const error = err as AxiosError;
      if (error?.response?.status === 409) {
        setIsFollowing(true);
      }
    } finally {
      setFollowLoading(false);
    }
  }, [token, username, followLoading, onFollow]);

  useEffect(() => {
    const shouldTrigger = paused && !hasInteractedRef.current && imdb_id;
    if (shouldTrigger) {
      hasInteractedRef.current = true;
      trailerTracker.triggerInteractionIfAny();
      trailerTracker.resetTracker();
    }
  }, [paused, invalid]);

  const compareHook = useCompareComponent(token);
  const handleRankingPress = (movie) => {
    compareHook.openFeedbackModal(movie);
  };
  useEffect(() => {
    if (isVisible) {
      hasInteractedRef.current = false;
      trailerTracker.resetTracker();
    }
  }, [isVisible]);
  const handleNavigation = (imdb_id: string, token: string) => {
    const movieIndex = Array.isArray(feedData) ? feedData.findIndex((m: any) => m?.movie?.imdb_id === imdb_id) : -1;
    navigation.navigate(ScreenNameEnum.MovieDetailScreen, {
      imdb_idData: imdb_id,
      token: token,
      movieList: feedData || [],
      initialIndex: movieIndex >= 0 ? movieIndex : 0,
      source: 'feedHome',
      filterGenreString: '',
      platformFilterString: '',
      selectedSimpleFilter: '1',
      selectedSortId: null,
      contentSelect: null,
      currentPage: 1,
      totalPages: 1,
    })
  };

  // Clear video buffer when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current = null; // release ref
      }
      // Optional force GC hint
      global.gc && global.gc();
    };
  }, [isScreenFocused]);

  // const previousImdbRef = useRef<string | null>(null);

  useEffect(() => {
    if (previousImdbRef.current && previousImdbRef.current !== imdb_id) {
      trailerTracker.triggerInteractionIfAny();
      trailerTracker.resetTracker();
    }
    previousImdbRef.current = imdb_id;
  }, [imdb_id]);

  const handleTogglePause = () => {
    if (!shouldAutoPlay) {
      setPaused(prev => !prev);
    }
  };

  // ---- VIDEO PROGRESS HANDLER ----
  const onVideoProgress = useCallback(async (data) => {
    if (paused) return;

    const progressPercent = data.currentTime / data.seekableDuration; // 👈 compute fraction between 0–1s
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 250,
      useNativeDriver: false,
    }).start();
    trailerTracker.onProgress({
      currentTime: data.currentTime,
      imdb_id,
      trailer_url: videoUri,
    });
  }, [paused, imdb_id, videoUri]);

  useEffect(() => {
    if (!isScreenFocused || !isVisible) {
      setPaused(true);
    } else {
      setTimeout(() => {
        setPaused(!(shouldAutoPlay && shouldPlay));

      }, 100);
    }
  }, [isVisible, isScreenFocused, shouldAutoPlay, shouldPlay, videoIndex]);


  useEffect(() => {
    if (videoUri && videoUri !== stableVideoUri.current) {
      stableVideoUri.current = videoUri;
    }
  }, [videoUri, videoIndex]);

  const navigateOnPoster = (imdb_id: string, token: string) => {
    const movieIndex = Array.isArray(feedData) ? feedData.findIndex((m: any) => m?.movie?.imdb_id === imdb_id) : -1;
    navigation.navigate(ScreenNameEnum.MovieDetailScreen, {
      imdb_idData: imdb_id,
      token,
      movieList: feedData || [],
      initialIndex: movieIndex >= 0 ? movieIndex : 0,
      source: 'feedHome',
      filterGenreString: '',
      platformFilterString: '',
      selectedSimpleFilter: '1',
      selectedSortId: null,
      contentSelect: null,
      currentPage: 1,
      totalPages: 1,
    });
  }
  const item = {
    username: username,
    name: user,
    avatar: avatar.uri

  };



  const hasRank =
    activity === "bookmarked"
      ? false
      : ranked && ranked > 0;

  const getActionLabel = () => {
    if (activity === "bookmarked, ranked" || activity === "ranked, bookmarked" || activity === "bookmarked,ranked" || activity === "ranked,bookmarked") {
      return " ranked and bookmarked "; // <-- replace with whatever text you want
    }
    if (activity == "bookmarked") {
      return " bookmarked"
    }
    if (activity == "ranked") {
      return " ranked"
    }
    return "";
  };
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.feedCard}>
      {suggested && (
        <View style={styles.suggestedRow}>
          <CustomText
            size={13}
            color={Color.whiteText}
            style={[{ marginBottom: 0, lineHeight: 25 }]}
            font={font.PoppinsMedium}
          >  {t('home.suggested')}</CustomText>
          <TouchableOpacity
            onPress={handleFollowToggle}
            disabled={followLoading || isFollowing}
            style={[styles.suggestedFollowButton, isFollowing && styles.suggestedFollowingButton]}>
            {followLoading ? (
              <ActivityIndicator color={Color.whiteText} size="small" />
            ) : (
              <Text style={styles.suggestedFollowText}>
                {isFollowing ? t('common.following') : t('common.follow')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.feedHeader}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() =>
            navigation.navigate(ScreenNameEnum.OtherProfile, { item: item })
          }
        >
          <FastImage
            source={{
              ...avatar,
              priority: FastImage.priority.low,
              cache: FastImage.cacheControl.immutable
            }}
            style={styles.feedAvatar}

          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}

          style={{ flex: 1, flexDirection: "row", alignItems: "center", }}
          onPress={() => {
            handleNavigation(imdb_id, token);

          }}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <CustomText
              size={14}
              color={Color.whiteText}
              style={styles.feedUser}
            >{user}
              <CustomText
                size={13}
                style={[styles.rankedText, {color: Color.subText}]}
                font={font.PoppinsRegular}
              >
                {getActionLabel()}


              </CustomText>
            </CustomText>

            <CustomText
              size={16}
              color={Color.lightPrimary}
              style={styles.feedTitle}
              font={font.PoppinsSemiBold}
              numberOfLines={2}
            >{title}</CustomText>

            {/* <Text >Today</Text> */}
            <CustomText
              size={12}
              color={Color.textGray}
              style={styles.todayText}
              font={font.PoppinsRegular}
            >{created_date}</CustomText>
          </View>
          {/* FRIEND SCORE → ONLY WHEN RANK EXISTS */}
          {hasRank && (
            <TouchableOpacity
              activeOpacity={1}

              style={{ alignSelf: 'flex-start' }} onPress={() => setShowFirstModal(!showFirstModal)} >

              <RankingWithInfo
                score={ranked}
                title={scoreType === "Rec" ? "Rec Score" : t("discover.friendscore")}
                description={
                  scoreType === "Rec"
                    ? t("discover.recscoredes")

                    // "This score predicts how much you'll enjoy this movie/show, based on your ratings and our custom algorithm."
                    : t("discover.frienddes")
                  // "This score shows the rating from your friend for this title."
                }
              />
            </TouchableOpacity>
          )}

          {/* <TouchableOpacity style={{ alignSelf: 'flex-start' }} onPress={() => setShowFirstModal(!showFirstModal)} >

            <RankingWithInfo
              score={ranked}
              title={scoreType === "Rec" ? "Rec Score" : "Friend Score"}
              description={
                scoreType === "Rec"
                  ? "This score predicts how much you'll enjoy this movie/show, based on your ratings and our custom algorithm."
                  : "This score shows the rating from your friend for this title."
              }
            />
          </TouchableOpacity> */}

        </TouchableOpacity>
      </View>

      {(comment ?? '').trim() !== '' && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.feedComment}
        >
          <CustomText
            size={13}
            color={Color.whiteText}
            font={font.PoppinsSemiBold}
            style={{ lineHeight: 18 }}
          >
            {t("common.comment")}:
            <CustomText
              size={13}
              color={Color.whiteText}
              style={{ marginLeft: 6 }}
              font={font.PoppinsRegular}
              numberOfLines={isExpanded ? undefined : 3}
            >
              {' '}{comment}
            </CustomText>
            {!isExpanded && comment.length > 100 && (
              <CustomText
                size={13}
                color={Color.lightPrimary}
                font={font.PoppinsSemiBold}
              >
                {' '}{t("common.seeMore")}
              </CustomText>
            )}
          </CustomText>
        </TouchableOpacity>
      )}

      {/* Video / Poster */}
      <TouchableOpacity onPress={handleTogglePause}>
        <View style={styles.videoWrapper}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => navigateOnPoster(imdb_id, token)}
            style={styles.posterOverlay}>
            {/* {!isPlaying && poster && posterVisible && ( */}
            {!isPlaying && (
              <FastImage
                source={{
                  ...poster,
                  priority: FastImage.priority.low,
                  cache: FastImage.cacheControl.immutable
                }}
                style={styles.posterOverlay}
                resizeMode={FastImage.resizeMode.stretch}
              />
            )}
          </TouchableOpacity>
          {(isVisible || shouldPlay) && stableVideoUri.current && stableVideoUri.current.trim() ? (
            <Video
              source={{ uri: stableVideoUri.current }}
              resizeMode="cover"
              repeat
              paused={paused}
              style={styles.video}
              muted={isMuted}
              automaticallyWaitsToMinimizeStalling={true}
              bufferConfig={{
                minBufferMs: 3000,
                maxBufferMs: 10000,
                bufferForPlaybackMs: 1500,
                bufferForPlaybackAfterRebufferMs: 3000,
              }}
              onLoad={handleVideoLoad}
              onReadyForDisplay={() => handleVideoLoad()}
              onProgress={onVideoProgress}
              onEnd={() => {
                if (!imdb_id || hasInteractedRef.current) {
                  return;
                }
                hasInteractedRef.current = true;
                trailerTracker.triggerInteractionIfAny();
              }}
              playInBackground={false}
              playWhenInactive={false}
              controls={false}
              disableFocus={true}
              hideShutterView
              shutterColor="transparent"
              progressUpdateInterval={250}
            />
          ) : (
            <FastImage
              source={{
                ...poster,
                priority: FastImage.priority.low,
                cache: FastImage.cacheControl.immutable,
              }}
              style={styles.video}
              resizeMode={FastImage.resizeMode.stretch}
            />
          )}

          {/* 👇 Progress bar should go here */}
        </View>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />


          {!paused && (
            <TouchableOpacity
              activeOpacity={1}

              style={styles.tButton}
              // onPress={() => setMuted(!muted)}
              onPress={() => dispatch(toggleMute())}
            >
              <Image
                source={isMuted ? imageIndex.volumeOff : imageIndex.mute}
                style={{ height: 18, width: 18, tintColor: Color.whiteText }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Footer Actions */}
      <View style={styles.footerActions}>
        <TouchableOpacity
          activeOpacity={1}

          onPress={() =>
            handleRankingPress({
              imdb_id,
              title,
              release_year,
              cover_image_url: poster?.uri || '',
            })
          }
        // onPress={() =>
        //   handleRankingPress({
        //     imdb_id,
        //     title,
        //     release_year,
        //     cover_image_url: poster?.uri || '', 
        //   })
        // }
        >
          <Image
            source={imageIndex.mdRankings}
            style={styles.footerIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ height: 35, width: 30 }}
          onPress={handleToggleBookmark}
        >
          <Image
            source={isBookmarked ? imageIndex.save : imageIndex.saveMark}
            style={styles.footerSaveIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

      </View>
      <View style={styles.footerDivider} />
      <ScoreIntroModal
        visible={showFirstModal}
        onClose={() => setShowFirstModal(false)}
        variant="second"
      />
      <CompareModals token={token} useCompareHook={compareHook} />
    </View>
  );
};



// export default FeedCard;
export default React.memo(FeedCardHome);






